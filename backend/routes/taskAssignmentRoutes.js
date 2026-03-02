import express from "express";
import {
    assignUser,
    getAssignmentsByTask,
    updateHours,
    removeAssignment,
} from "../controllers/taskAssignmentController.js";

const router = express.Router();

router.post("/", /* protect, */ assignUser);
router.get("/", /* protect, */ getAssignmentsByTask);        // ?taskId=xxx
router.patch("/:id/hours", /* protect, */ updateHours);
router.patch("/:id/remove", /* protect, */ removeAssignment);

export default router;
