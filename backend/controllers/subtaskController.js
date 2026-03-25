import mongoose from "mongoose";
import Subtask from "../models/subtask.js";
import Task from "../models/task.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// @desc    Create a new subtask under a main task
// @route   POST /api/se/projects/:projectId/tasks/:taskId/subtasks
// @access  Site Engineer
export const createSubtask = async (req, res) => {
    try {
        const { name, description, assignedWorkers, startDate, endDate, priority } = req.body;
        const projectId = req.params.projectId;
        const parentTaskId = req.params.taskId;

        if (!isValidId(projectId) || !isValidId(parentTaskId)) {
            return res.status(400).json({ success: false, message: "Invalid project or task ID." });
        }

        const parentTask = await Task.findOne({ _id: parentTaskId, projectId });
        if (!parentTask) {
            return res.status(404).json({ success: false, message: "Parent task not found in this project." });
        }

        if (new Date(startDate) < new Date(parentTask.startDate) || new Date(endDate) > new Date(parentTask.endDate)) {
            return res.status(400).json({ success: false, message: "Subtask dates must fall strictly within the parent task's date limit." });
        }

        if (assignedWorkers && assignedWorkers.length > 0) {
            const parentWorkerIds = parentTask.assignedWorkers.map(w => w.toString());
            const invalidWorkers = assignedWorkers.filter(id => !parentWorkerIds.includes(id.toString()));
            if (invalidWorkers.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: "All assigned workers must be actively allocated to the parent task.",
                    invalidWorkers
                });
            }
        }

        const subtask = await Subtask.create({
            projectId,
            parentTaskId,
            name,
            description,
            startDate,
            endDate,
            assignedWorkers,
            priority: priority || "Medium",
            status: "Not Started",
            assignedSiteEngineer: req.user._id
        });

        return res.status(201).json({ success: true, message: "Subtask delegated successfully.", subtask });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Request completion of a subtask (Worker -> SE)
// @route   PATCH /api/se/projects/:projectId/subtasks/:subtaskId/request-completion
// @access  Site Engineer / Worker
export const requestSubtaskCompletion = async (req, res) => {
    try {
        const subtaskId = req.params.subtaskId;

        if (!isValidId(subtaskId)) {
            return res.status(400).json({ success: false, message: "Invalid subtask ID" });
        }

        const subtask = await Subtask.findOne({ _id: subtaskId, projectId: req.params.projectId });
        if (!subtask) {
            return res.status(404).json({ success: false, message: "Subtask not found" });
        }

        const PermitToWork = (await import("../models/permitToWork.js")).default;
        const deniedPtw = await PermitToWork.findOne({ taskId: subtaskId, status: "Denied" });
        if (deniedPtw) {
            return res.status(403).json({ success: false, message: "Cannot request completion: The Permit to Work for this subtask was denied by the Safety Officer." });
        }

        subtask.completionRequested = true;
        subtask.completionRequestedAt = new Date();
        subtask.completionRequestedBy = req.user._id;

        await subtask.save();

        return res.status(200).json({ success: true, message: "Subtask completion requested.", subtask });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Approve completion of a subtask (SE)
// @route   PATCH /api/se/projects/:projectId/subtasks/:subtaskId/approve-completion
// @access  Site Engineer
export const approveSubtaskCompletion = async (req, res) => {
    try {
        const subtaskId = req.params.subtaskId;

        if (!isValidId(subtaskId)) {
            return res.status(400).json({ success: false, message: "Invalid subtask ID" });
        }

        const subtask = await Subtask.findOne({ _id: subtaskId, projectId: req.params.projectId });
        if (!subtask) {
            return res.status(404).json({ success: false, message: "Subtask not found" });
        }

        if (subtask.status === "Completed") {
            return res.status(400).json({ success: false, message: "Subtask is already formally completed." });
        }

        subtask.status = "Completed";
        subtask.completionApprovedBy = req.user._id;
        subtask.completionApprovedAt = new Date();

        await subtask.save();

        return res.status(200).json({ success: true, message: "Subtask formally closed.", subtask });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
