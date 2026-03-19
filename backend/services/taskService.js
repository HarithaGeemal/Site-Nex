import Task from "../models/task.js";
import mongoose from "mongoose";

class TaskService {
    /**
     * Automatically shift dates of dependent tasks if their parent's endDate is moved past their startDate.
     * @param {string} taskId
     */
    static async autoRescheduleDependentTasks(taskId) {
        const task = await Task.findById(taskId);
        if (!task || task.isCancled) return;

        // Find immediately dependent tasks 
        const dependentTasks = await Task.find({ dependencyTaskIds: taskId, isCancled: false });

        for (const depTask of dependentTasks) {
            if (task.endDate && depTask.startDate) {
                const parentEnd = new Date(task.endDate);
                const depStart = new Date(depTask.startDate);

                if (depStart < parentEnd) {
                    const durationMs = new Date(depTask.endDate).getTime() - depStart.getTime();

                    // Shift dependent task dates forward
                    depTask.startDate = parentEnd;
                    depTask.endDate = new Date(parentEnd.getTime() + durationMs);

                    await depTask.save();

                    // Recursively shift downstream dependents
                    await TaskService.autoRescheduleDependentTasks(depTask._id);
                }
            }
        }
    }

    /**
     * Add a progress note to a task
     */
    static async addProgressNote(taskId, note, userId) {
        const task = await Task.findById(taskId);
        if (!task) throw new Error("Task not found");

        task.progressNotes.push({ note, createdBy: userId });
        await task.save();

        return task;
    }

    /**
     * Get notes for a task, sorted descending by creation date
     */
    static async getTaskNotes(taskId) {
        const task = await Task.findById(taskId).populate("progressNotes.createdBy", "name email");
        if (!task) throw new Error("Task not found");

        return task.progressNotes.sort((a, b) => b.createdAt - a.createdAt);
    }

    /**
     * Completes a DFS graph traversal to ensure adding `newDependencyIds` to `taskId`
     * does not create a cycle (e.g. A -> B -> C -> A).
     * 
     * @param {string} projectId 
     * @param {string} taskId (can be null for new tasks)
     * @param {string[]} newDependencyIds
     * @throws Error if a cycle is detected
     */
    static async validateDependencies(projectId, taskId, newDependencyIds) {
        if (!newDependencyIds || newDependencyIds.length === 0) return;

        // Fetch all active tasks for the project to build the graph
        const allTasks = await Task.find({ projectId, isCancled: false }).select("_id dependencyTaskIds name");

        // Build adjacency list: Map of TaskId -> Array of Dependency TaskIds
        const graph = new Map();
        allTasks.forEach(t => {
            const deps = t.dependencyTaskIds ? t.dependencyTaskIds.map(id => id.toString()) : [];
            graph.set(t._id.toString(), deps);
        });

        // If we are updating an existing task, temporarily inject the NEW proposed dependencies into the graph
        if (taskId) {
            graph.set(taskId.toString(), newDependencyIds.map(id => id.toString()));
        } else {
            // For a brand new task, we assign a dummy ID to represent it in the graph
            const dummyId = new mongoose.Types.ObjectId().toString();
            graph.set(dummyId, newDependencyIds.map(id => id.toString()));
        }

        // DFS Cycle Detection Algorithm
        const visited = new Set();
        const recursionStack = new Set();

        const hasCycle = (currentNode) => {
            if (recursionStack.has(currentNode)) return true;
            if (visited.has(currentNode)) return false;

            visited.add(currentNode);
            recursionStack.add(currentNode);

            const neighbors = graph.get(currentNode) || [];
            for (const neighbor of neighbors) {
                if (hasCycle(neighbor)) return true;
            }

            recursionStack.delete(currentNode);
            return false;
        };

        // Check every node in the graph for cycles
        for (const [nodeId] of graph.entries()) {
            if (hasCycle(nodeId)) {
                throw new Error(`Circular dependency detected in project graph. Operation aborted to prevent a cycle.`);
            }
        }
    }
}

export default TaskService;
