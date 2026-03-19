import mongoose from "mongoose";
import Task from "../models/task.js";
import Project from "../models/projects.js";
import TaskAssignment from "../models/taskAssignment.js";
import Issue from "../models/issue.js";
import TaskService from "../services/taskService.js";
import EventService from "../services/eventService.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// @desc    Create a new task under a project
// @route   POST /api/tasks
// @access  Admin / Project Manager
export const createTask = async (req, res) => {
    try {
        const { name, description, status, priority, startDate, endDate, percentComplete, dependencyTaskIds, estimatedHours, actualHours } = req.body;
        const projectId = req.project._id;

        // Validate task dates fit within project dates
        if (new Date(startDate) < new Date(req.project.startDate) || new Date(endDate) > new Date(req.project.endDate)) {
            return res.status(400).json({
                success: false,
                message: `Task dates must be within the project range (${req.project.startDate.toISOString().split("T")[0]} → ${req.project.endDate.toISOString().split("T")[0]})`,
            });
        }

        // Delegate to TaskService for DFS Graph Cycle validation
        await TaskService.validateDependencies(projectId, null, dependencyTaskIds);

        const task = await Task.create({
            projectId,
            name,
            description,
            status,
            priority,
            startDate,
            endDate,
            percentComplete: percentComplete || 0,
            dependencyTaskIds: dependencyTaskIds || [],
            estimatedHours,
            actualHours,
        });

        // Sync project progress asynchronously so we don't block the response (Point H)
        EventService.emit("project:syncProgress", projectId);

        return res.status(201).json({ success: true, message: "Task created successfully", task });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all active tasks for a project
// @route   GET /api/tasks?projectId=xxx
// @access  Private
export const getTasksByProject = async (req, res) => {
    try {
        const projectId = req.project._id;

        const tasks = await Task.find({ projectId, isCancled: false })
            .populate("dependencyTaskIds", "name status percentComplete")
            .sort({ startDate: 1 });

        return res.status(200).json({ success: true, tasks });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get a single task by ID
// @route   GET /api/tasks/:id
// @access  Private
export const getTaskById = async (req, res) => {
    try {
        // req.task is loaded by the generic loadTask middleware
        const task = await Task.findById(req.task._id)
            .populate("projectId", "name location")
            .populate("dependencyTaskIds", "name status percentComplete");

        return res.status(200).json({ success: true, task });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Admin / Project Manager / Site Engineer
export const updateTask = async (req, res) => {
    try {
        const { name, description, status, priority, startDate, endDate, percentComplete, dependencyTaskIds, estimatedHours, actualHours } = req.body;

        // Validate date bounds against the project if modifying dates
        if (startDate || endDate) {
            const finalStart = new Date(startDate || req.task.startDate);
            const finalEnd = new Date(endDate || req.task.endDate);

            if (finalStart < new Date(req.project.startDate) || finalEnd > new Date(req.project.endDate)) {
                return res.status(400).json({
                    success: false,
                    message: `Task dates must be within the project range (${req.project.startDate.toISOString().split("T")[0]} → ${req.project.endDate.toISOString().split("T")[0]})`,
                });
            }
        }

        // Delegate to TaskService for DFS Graph Cycle validation
        if (dependencyTaskIds && dependencyTaskIds.length > 0) {
            await TaskService.validateDependencies(req.project._id, req.task._id, dependencyTaskIds);
        }

        // Only update defined fields
        if (name !== undefined) req.task.name = name;
        if (description !== undefined) req.task.description = description;
        if (status !== undefined) req.task.status = status;
        if (priority !== undefined) req.task.priority = priority;
        if (startDate !== undefined) req.task.startDate = startDate;
        if (endDate !== undefined) req.task.endDate = endDate;
        if (percentComplete !== undefined) req.task.percentComplete = percentComplete;
        if (dependencyTaskIds !== undefined) req.task.dependencyTaskIds = dependencyTaskIds;
        if (estimatedHours !== undefined) req.task.estimatedHours = estimatedHours;
        if (actualHours !== undefined) req.task.actualHours = actualHours;

        // If trying to complete task, ensure no open issues exist
        if (req.task.status === "Completed" || req.task.percentComplete === 100) {
            const openIssuesCount = await Issue.countDocuments({
                taskId: req.task._id,
                status: { $nin: ["Resolved", "Closed"] }
            });

            if (openIssuesCount > 0) {
                return res.status(422).json({
                    success: false,
                    message: `Cannot complete task. There are ${openIssuesCount} open issues blocking this task. Resolve them first.`
                });
            }
            req.task.status = "Completed";
            req.task.percentComplete = 100;
        }

        await req.task.save();

        if (endDate !== undefined) {
            await TaskService.autoRescheduleDependentTasks(req.task._id);
        }

        // Sync project progress asynchronously
        EventService.emit("project:syncProgress", req.task.projectId);

        return res.status(200).json({ success: true, message: "Task updated successfully", task: req.task });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Soft-cancel a task
// @route   PATCH /api/tasks/:id/cancel
// @access  Admin / Project Manager
export const cancelTask = async (req, res) => {
    try {
        req.task.isCancled = true;
        req.task.status = "Cancelled";
        await req.task.save();

        // Cascade: soft-remove all active assignments
        await TaskAssignment.updateMany(
            { taskId: req.task._id, removedAt: null },
            { removedAt: new Date(), removedReason: "Task cancelled" }
        );

        // Cascade: close any open issues linked to this task
        await Issue.updateMany(
            { taskId: req.task._id, status: { $nin: ["Resolved", "Closed"] } },
            { status: "Closed", closedAt: new Date() }
        );

        // Sync project progress asynchronously
        EventService.emit("project:syncProgress", req.task.projectId);

        return res.status(200).json({ success: true, message: "Task cancelled successfully", task: req.task });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Add a progress note to a task
// @route   POST /api/tasks/:id/notes
// @access  Project Team
export const addProgressNote = async (req, res) => {
    try {
        const { note } = req.body;
        if (!note) return res.status(400).json({ success: false, message: "Note is required" });

        const updatedTask = await TaskService.addProgressNote(req.task._id, note, req.user._id);
        return res.status(201).json({ success: true, message: "Progress note added", task: updatedTask });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all progress notes for a task (descending by date)
// @route   GET /api/tasks/:id/notes
// @access  Project Member
export const getTaskNotes = async (req, res) => {
    try {
        const notes = await TaskService.getTaskNotes(req.task._id);
        return res.status(200).json({ success: true, notes });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
