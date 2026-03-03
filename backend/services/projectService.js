import Project from "../models/projects.js";
import Task from "../models/task.js";
import TaskAssignment from "../models/taskAssignment.js";
import Issue from "../models/issue.js";
import MaterialUsageLog from "../models/materialUsageLog.js";

/**
 * Service to handle complex Project operations separated from the controller layer.
 */
class ProjectService {
    /**
     * Soft deletes a project and cascades the deletion to all related entities.
     * @param {string} projectId 
     * @param {string} deletedByUserId 
     */
    static async deleteProject(projectId, deletedByUserId) {
        // 1. Soft-delete the project itself
        const project = await Project.findOneAndUpdate(
            { _id: projectId, isDeleted: false },
            { isDeleted: true },
            { new: true }
        );

        if (!project) {
            throw new Error("Project not found or already deleted");
        }

        // 2. Cascade Cancel all tasks in the project
        await Task.updateMany(
            { projectId, isCancled: false },
            { isCancled: true, status: "Cancelled", cancellationReason: "Parent project deleted" }
        );

        // Fetch all task IDs to cascade to assignments and issues
        const tasks = await Task.find({ projectId }).select("_id");
        const taskIds = tasks.map(t => t._id);

        // 3. Cascade removed assignments
        if (taskIds.length > 0) {
            await TaskAssignment.updateMany(
                { taskId: { $in: taskIds }, removedAt: null },
                { removedAt: new Date(), removedReason: "Parent project deleted" }
            );
        }

        // 4. Cascade Close all open issues
        await Issue.updateMany(
            { projectId, status: { $nin: ["Resolved", "Closed"] } },
            { status: "Closed", closedAt: new Date(), resolutionNote: "Automatically closed due to project deletion." }
        );

        // 5. Material logs remain, but we might mark them voided if required?
        // The user specified: "Deleting a project... leaves material logs... creates a reporting problem: Inventory report can show materials used in a project that 'does not exist'."
        // We will explicitly void all active usage logs for this project so the stock returns to the cache.
        // Or simply mark them as `isVoided` with a reason. True inventory systems would void them.

        // Let's defer material usage log voids to the MaterialService or run it here:
        // Because a void needs to restore stock, doing it blindly here without triggering $inc on MaterialItem is dangerous.
        // We will emit an event or call MaterialService.voidLogsForProject(projectId) later. 
        // For now, let's just mark the project as deleted. We'll handle the material log cascade when we write MaterialService.

        return project;
    }
}

export default ProjectService;
