import TaskAssignment from "../models/taskAssignment.js";


export const assignUser = async (req, res) => {
    try {
        const { taskId, userId, roleOnTask, expectedHours } = req.body;

        const existing = await TaskAssignment.findOne({ taskId, userId });
        if (existing) {
            res.json({ success: false, message: "User is already assigned to this task" });
            return;
        }

        const assignment = await TaskAssignment.create({
            taskId,
            userId,
            roleOnTask,
            expectedHours: expectedHours || 0,
        });

        res.json({ success: true, message: "User assigned to task successfully", assignment });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const getAssignmentsByTask = async (req, res) => {
    try {
        const { taskId } = req.query;

        if (!taskId) {
            res.json({ success: false, message: "taskId query parameter is required" });
            return;
        }

        const assignments = await TaskAssignment.find({ taskId, removedAt: null })
            .populate("userId", "name email userRole phone");

        res.json({ success: true, assignments });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const updateHours = async (req, res) => {
    try {
        const { expectedHours, actualHours, workStarted } = req.body;

        const assignment = await TaskAssignment.findByIdAndUpdate(
            req.params.id,
            { expectedHours, actualHours, workStarted },
            { new: true, runValidators: true }
        );

        if (!assignment) {
            res.json({ success: false, message: "Assignment not found" });
            return;
        }

        res.json({ success: true, message: "Hours updated successfully", assignment });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const removeAssignment = async (req, res) => {
    try {
        const { removedReason } = req.body;

        const assignment = await TaskAssignment.findByIdAndUpdate(
            req.params.id,
            { removedAt: new Date(), removedReason },
            { new: true }
        );

        if (!assignment) {
            res.json({ success: false, message: "Assignment not found" });
            return;
        }

        res.json({ success: true, message: "User removed from task successfully", assignment });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
