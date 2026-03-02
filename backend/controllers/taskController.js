import Task from "../models/task.js";


export const createTask = async (req, res) => {
    try {
        const { projectId, name, description, status, priority, startDate, endDate, percentComplete, dependencyTaskIds } = req.body;

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
        });

        res.json({ success: true, message: "Task created successfully", task });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const getTasksByProject = async (req, res) => {
    try {
        const { projectId } = req.query;

        if (!projectId) {
            res.json({ success: false, message: "projectId query parameter is required" });
            return;
        }

        const tasks = await Task.find({ projectId, isCancled: false })
            .populate("dependencyTaskIds", "name status percentComplete")
            .sort({ startDate: 1 });

        res.json({ success: true, tasks });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate("dependencyTaskIds", "name status percentComplete");

        if (!task) {
            res.json({ success: false, message: "Task not found" });
            return;
        }

        res.json({ success: true, task });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const updateTask = async (req, res) => {
    try {
        const { name, description, status, priority, startDate, endDate, percentComplete, dependencyTaskIds } = req.body;

        const task = await Task.findByIdAndUpdate(
            req.params.id,
            { name, description, status, priority, startDate, endDate, percentComplete, dependencyTaskIds },
            { new: true, runValidators: true }
        );

        if (!task) {
            res.json({ success: false, message: "Task not found" });
            return;
        }

        res.json({ success: true, message: "Task updated successfully", task });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const cancelTask = async (req, res) => {
    try {
        const { cancellationReason } = req.body;

        const task = await Task.findByIdAndUpdate(
            req.params.id,
            { isCancled: true, cancellationReason },
            { new: true }
        );

        if (!task) {
            res.json({ success: false, message: "Task not found" });
            return;
        }

        res.json({ success: true, message: "Task cancelled successfully", task });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const deleteTask = async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);

        if (!task) {
            res.json({ success: false, message: "Task not found" });
            return;
        }

        res.json({ success: true, message: "Task deleted successfully" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
