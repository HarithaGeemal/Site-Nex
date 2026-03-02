import express from "express";
import {
    createTask,
    getTasksByProject,
    getTaskById,
    updateTask,
    cancelTask,
    deleteTask,
} from "../controllers/taskController.js";

const router = express.Router();

router.post("/", /* protect, */ createTask);
router.get("/", /* protect, */ getTasksByProject);       // ?projectId=xxx
router.get("/:id", /* protect, */ getTaskById);
router.put("/:id", /* protect, */ updateTask);
router.patch("/:id/cancel", /* protect, */ cancelTask);
router.delete("/:id", /* protect, authorizeRoles("ADMIN"), */ deleteTask);

export default router;
