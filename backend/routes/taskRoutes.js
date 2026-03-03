import express from "express";
import protect from "../middlewares/authMiddleware.js";
import { loadTask, authorizeProjectAccess } from "../middlewares/rbacMiddleware.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { createTaskSchema, updateTaskSchema, taskParamSchema } from "../validations/schemas.js";
import {
    createTask,
    getTasksByProject,
    getTaskById,
    updateTask,
    cancelTask,
} from "../controllers/taskController.js";

const router = express.Router();

// All task routes are mounted under /api/projects/:projectId/tasks
// The project context is already verified by loadProject in projectRoutes/server

// Creation — Admin/PM only
router.post("/", protect, validateRequest({ body: createTaskSchema }), authorizeProjectAccess("PROJECT_MANAGER"), createTask);

// Reading — restricted to any project member
router.get("/", protect, authorizeProjectAccess("STORE_KEEPER"), getTasksByProject);

// For specific tasks, load them first
router.use("/:taskId", protect, validateRequest({ params: taskParamSchema }), loadTask);

// Reading single task
router.get("/:taskId", authorizeProjectAccess("STORE_KEEPER"), getTaskById);

// Mutation — member + role restricted
router.put("/:taskId", validateRequest({ body: updateTaskSchema }), authorizeProjectAccess("SITE_ENGINEER"), updateTask);
router.patch("/:taskId/cancel", authorizeProjectAccess("PROJECT_MANAGER"), cancelTask);

export default router;
