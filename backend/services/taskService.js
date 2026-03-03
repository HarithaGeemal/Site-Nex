import Task from "../models/task.js";
import mongoose from "mongoose";

class TaskService {
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
