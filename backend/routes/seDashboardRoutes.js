import express from "express";
import { getSEDashboardMetrics, getSEAssignedTasks, getSESubtaskApprovals, getSEMaterialRequests, getSEProjects } from "../controllers/seDashboardController.js";
import { createSubtask, requestSubtaskCompletion, approveSubtaskCompletion } from "../controllers/subtaskController.js";
import protect from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

// Dashboards and Analytics
router.get("/metrics", getSEDashboardMetrics);

// Distinct Task streams
router.get("/assigned-tasks", getSEAssignedTasks);
router.get("/subtask-approvals", getSESubtaskApprovals);
router.get("/my-projects", getSEProjects);

// Subtask Operations
router.post("/projects/:projectId/tasks/:taskId/subtasks", createSubtask);
router.patch("/projects/:projectId/subtasks/:subtaskId/request-completion", requestSubtaskCompletion);
router.patch("/projects/:projectId/subtasks/:subtaskId/approve-completion", approveSubtaskCompletion);

// Material Streams
router.get("/material-requests", getSEMaterialRequests);

export default router;
