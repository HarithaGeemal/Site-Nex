import Issue from "../models/issue.js";

export const createIssue = async (req, res) => {
    try {
        const { issueTitle, projectId, taskId, description, priority, dueDate } = req.body;

        const issue = await Issue.create({
            issueTitle,
            projectId,
            taskId: taskId || null,
            description,
            priority,
            dueDate,
            createdBy: req.user._id,
        });

        res.json({ success: true, message: "Issue created successfully", issue });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const getIssuesByProject = async (req, res) => {
    try {
        const { projectId, status, priority } = req.query;

        if (!projectId) {
            res.json({ success: false, message: "projectId query parameter is required" });
            return;
        }

        const filter = { projectId };
        if (status) filter.status = status;
        if (priority) filter.priority = priority;

        const issues = await Issue.find(filter)
            .populate("createdBy", "name email")
            .populate("assignedTo", "name email userRole")
            .populate("taskId", "name status")
            .sort({ createdAt: -1 });

        res.json({ success: true, issues });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const getIssueById = async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id)
            .populate("createdBy", "name email")
            .populate("assignedTo", "name email userRole")
            .populate("taskId", "name status percentComplete")
            .populate("projectId", "name location");

        if (!issue) {
            res.json({ success: false, message: "Issue not found" });
            return;
        }

        res.json({ success: true, issue });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const updateIssue = async (req, res) => {
    try {
        const { issueTitle, description, priority, dueDate, status } = req.body;

        const issue = await Issue.findByIdAndUpdate(
            req.params.id,
            { issueTitle, description, priority, dueDate, status },
            { new: true, runValidators: true }
        );

        if (!issue) {
            res.json({ success: false, message: "Issue not found" });
            return;
        }

        res.json({ success: true, message: "Issue updated successfully", issue });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const assignIssue = async (req, res) => {
    try {
        const { assignedTo } = req.body;

        const issue = await Issue.findByIdAndUpdate(
            req.params.id,
            { assignedTo, status: "Assigned" },
            { new: true }
        ).populate("assignedTo", "name email");

        if (!issue) {
            res.json({ success: false, message: "Issue not found" });
            return;
        }

        res.json({ success: true, message: "Issue assigned successfully", issue });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const resolveIssue = async (req, res) => {
    try {
        const { resolutionNote } = req.body;

        const issue = await Issue.findByIdAndUpdate(
            req.params.id,
            { status: "Resolved", resolutionNote, resolvedAt: new Date() },
            { new: true }
        );

        if (!issue) {
            res.json({ success: false, message: "Issue not found" });
            return;
        }

        res.json({ success: true, message: "Issue resolved successfully", issue });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const closeIssue = async (req, res) => {
    try {
        const issue = await Issue.findByIdAndUpdate(
            req.params.id,
            { status: "Closed", closedAt: new Date() },
            { new: true }
        );

        if (!issue) {
            res.json({ success: false, message: "Issue not found" });
            return;
        }

        res.json({ success: true, message: "Issue closed successfully", issue });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
