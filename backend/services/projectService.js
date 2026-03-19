import Project from "../models/projects.js";
import Task from "../models/task.js";
import TaskAssignment from "../models/taskAssignment.js";
import Issue from "../models/issue.js";
import MaterialUsageLog from "../models/materialUsageLog.js";
import ProjectMembership from "../models/projectMembership.js";
import MaterialService from "./materialService.js";

/**
 * Service to handle complex Project operations separated from the controller layer.
 */
class ProjectService {
    /**
     * Get Project Dashboard KPIs
     * @param {string} projectId 
     */
    static async getProjectDashboard(projectId) {
        const project = await Project.findById(projectId);
        if (!project) throw new Error("Project not found");

        const tasks = await Task.find({ projectId, isCancled: false });
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.status === "Completed").length;

        const openIssues = await Issue.countDocuments({
            projectId,
            status: { $nin: ["Resolved", "Closed"] }
        });

        const teamSize = await ProjectMembership.countDocuments({
            projectId,
            removedAt: null
        });

        let budgetUsedPercentage = 0;
        if (project.plannedBudget && project.plannedBudget > 0) {
            budgetUsedPercentage = (project.actualBudgetUsed / project.plannedBudget) * 100;
        }

        return {
            totalTasks,
            completedTasks,
            openIssues,
            teamSize,
            budgetUsedPercentage
        };
    }

    /**
     * Get Gantt Chart format tasks
     * @param {string} projectId 
     */
    static async getProjectGantt(projectId) {
        const tasks = await Task.find({ projectId, isCancled: false })
            .select("_id name startDate endDate dependencyTaskIds percentComplete status")
            .sort({ startDate: 1 });

        return tasks.map(t => ({
            id: t._id,
            name: t.name,
            startDate: t.startDate,
            endDate: t.endDate,
            dependencies: t.dependencyTaskIds,
            percentComplete: t.percentComplete,
            status: t.status
        }));
    }

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

        // 5. Cascade void material usage logs
        await MaterialService.voidLogsForProject(projectId, deletedByUserId, "Parent project deleted");

        return project;
    }
}

export default ProjectService;
