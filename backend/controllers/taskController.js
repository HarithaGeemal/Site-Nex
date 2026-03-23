import mongoose from "mongoose";
import Task from "../models/task.js";
import Project from "../models/projects.js";
import TaskAssignment from "../models/taskAssignment.js";
import Issue from "../models/issue.js";
import TaskService from "../services/taskService.js";
import EventService from "../services/eventService.js";
import DeletionLog from "../models/deletionLog.js";
import SafetyNotice from "../models/safetyNotice.js";
import PermitToWork from "../models/permitToWork.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// @desc    Create a new task under a project
// @route   POST /api/projects/:projectId/tasks
// @access  Admin / Project Manager
export const createTask = async (req, res) => {
    try {
        const { name, description, status, priority, startDate, endDate, percentComplete, dependencyTaskIds, estimatedHours, actualHours } = req.body;
        const projectId = req.project._id;

        if (new Date(startDate) >= new Date(endDate)) {
            return res.status(400).json({
                success: false,
                message: "startDate must be before endDate"
            });
        }
        // Validate task dates fit within project dates
        if (new Date(startDate) < new Date(req.project.startDate) || new Date(endDate) > new Date(req.project.endDate)) {
            return res.status(400).json({
                success: false,
                message: `Task dates must be within the project range (${req.project.startDate.toISOString().split("T")[0]} → ${req.project.endDate.toISOString().split("T")[0]})`,
            });
        }

        // Prevent direct creation as completed
        if (status === "Completed" || percentComplete === 100) {
            return res.status(422).json({
                success: false,
                message: "Cannot create a task directly as Completed. Please create it first and follow the completion workflow."
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
// @route   GET /api/projects/:projectId/tasks
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
// @route   GET /api/projects/:projectId/tasks/:id
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
// @route   PUT /api/projects/:projectId/tasks/:id
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

        // Prevent direct completion bypass
        const isCurrentlyCompleted = req.task.status === "Completed" || req.task.percentComplete === 100;
        const intendsToComplete = status === "Completed" || percentComplete === 100;
        if (!isCurrentlyCompleted && intendsToComplete && !req.task.completionApprovedAt) {
            return res.status(422).json({
                success: false,
                message: "Direct completion is not allowed. Please use the request and approve completion workflow.",
            });
        }

        // Prevent starting task if blocked by Safety
        if (status === "In Progress" && req.task.status !== "In Progress") {
            const activeNotice = await SafetyNotice.findOne({ taskId: req.task._id, status: "Active" });
            if (activeNotice) {
                return res.status(422).json({
                    success: false,
                    message: "Cannot start task. It is blocked by an active Stop/Hold Notice."
                });
            }
            const pendingPTW = await PermitToWork.findOne({ taskId: req.task._id, status: { $in: ["Pending", "Denied", "Revoked"] } });
            if (pendingPTW) {
                return res.status(422).json({
                    success: false,
                    message: `Cannot start task. A Permit to Work (${pendingPTW.permitType}) is currently ${pendingPTW.status}.`
                });
            }
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

// @desc    Hard-delete a task
// @route   PATCH /api/projects/:projectId/tasks/:id/cancel
// @access  Admin / Project Manager
export const cancelTask = async (req, res) => {
    try {
        const { reason } = req.body;
        const deletedByUserId = req.user._id;

        // Fetch assignments to log
        const assignments = await TaskAssignment.find({ taskId: req.task._id });
        
        const logs = [];
        logs.push({ entityType: "Task", entityId: req.task._id, entityName: req.task.name, deletedBy: deletedByUserId, reason: reason || "Not specified" });
        
        assignments.forEach(a => logs.push({ entityType: "TaskAssignment", entityId: a._id, deletedBy: deletedByUserId, reason: "Parent task deleted" }));

        if (logs.length > 0) {
            await DeletionLog.insertMany(logs);
        }

        // Hard deletes
        await TaskAssignment.deleteMany({ taskId: req.task._id });
        await Issue.deleteMany({ taskId: req.task._id });
        await req.task.deleteOne();

        // Sync project progress asynchronously
        EventService.emit("project:syncProgress", req.task.projectId);

        return res.status(200).json({ success: true, message: "Task deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Add a progress note to a task
// @route   POST /api/projects/:projectId/tasks/:id/notes
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
// @route   GET /api/projects/:projectId/tasks/:id/notes
// @access  Project Member
export const getTaskNotes = async (req, res) => {
    try {
        const notes = await TaskService.getTaskNotes(req.task._id);
        return res.status(200).json({ success: true, notes });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Request task completion (Site Engineer)
// @route   PATCH /api/projects/:projectId/tasks/:taskId/request-completion
// @access  Site Engineer or above
export const requestCompletion = async (req, res) => {
    try {
        const { note } = req.body;
        const task = await TaskService.requestCompletion(req.task._id, req.user._id, note);
        return res.status(200).json({ success: true, message: "Task completion requested", task });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Approve task completion (Project Manager)
// @route   PATCH /api/projects/:projectId/tasks/:taskId/approve-completion
// @access  Project Manager or above
export const approveCompletion = async (req, res) => {
    try {
        const { note } = req.body;
        const task = await TaskService.approveCompletion(req.task._id, req.user._id, note);

        // Complete cascade (auto reschedule & event sync)
        await TaskService.autoRescheduleDependentTasks(task._id);
        EventService.emit("project:syncProgress", task.projectId);

        return res.status(200).json({ success: true, message: "Task completion approved", task });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get blocked tasks for a project
// @route   GET /api/projects/:projectId/tasks/blocked
// @access  Site Engineer
export const getBlockedTasks = async (req, res) => {
    try {
        const tasks = await TaskService.getBlockedTasks(req.project._id);
        return res.status(200).json({ success: true, tasks });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
