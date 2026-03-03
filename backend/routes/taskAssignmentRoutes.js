import express from "express";
import protect from "../middlewares/authMiddleware.js";
import { loadAssignment, authorizeProjectAccess } from "../middlewares/rbacMiddleware.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { idParamSchema } from "../validations/schemas.js";
import {
    assignUser,
    getAssignmentsByTask,
    updateHours,
    removeAssignment,
} from "../controllers/taskAssignmentController.js";

const router = express.Router();

// All routes mapped under /api/projects/:projectId/task-assignments

// assignUser fetches its taskId internally or from body; since task assignment requires taskId in body, validate it.
// To keep it strictly REST under projectId, we trust req.project
router.post("/", protect, authorizeProjectAccess("PROJECT_MANAGER"), assignUser);
router.get("/", protect, authorizeProjectAccess("STORE_KEEPER"), getAssignmentsByTask); // ?taskId=xxx

router.use("/:assignmentId", protect, validateRequest({ params: idParamSchema }), loadAssignment);

router.patch("/:assignmentId/hours", authorizeProjectAccess("SITE_ENGINEER"), updateHours);
router.patch("/:assignmentId/remove", authorizeProjectAccess("PROJECT_MANAGER"), removeAssignment);

export default router;
