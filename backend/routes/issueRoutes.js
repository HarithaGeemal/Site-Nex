import express from "express";
import protect from "../middlewares/authMiddleware.js";
import { loadIssue, authorizeProjectAccess } from "../middlewares/rbacMiddleware.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { createIssueSchema, idParamSchema } from "../validations/schemas.js";
import {
    createIssue,
    getIssuesByProject,
    getIssueById,
    updateIssue,
    assignIssue,
    resolveIssue,
    closeIssue,
} from "../controllers/issueController.js";

const router = express.Router();

// All routes mapped under /api/projects/:projectId/issues

router.post("/", protect, validateRequest({ body: createIssueSchema }), authorizeProjectAccess("STORE_KEEPER"), createIssue);
router.get("/", protect, authorizeProjectAccess("STORE_KEEPER"), getIssuesByProject);

router.use("/:issueId", protect, validateRequest({ params: idParamSchema }), loadIssue);

router.get("/:issueId", authorizeProjectAccess("STORE_KEEPER"), getIssueById);
router.put("/:issueId", authorizeProjectAccess("SITE_ENGINEER"), updateIssue);
router.patch("/:issueId/assign", authorizeProjectAccess("PROJECT_MANAGER"), assignIssue);
router.patch("/:issueId/resolve", authorizeProjectAccess("SITE_ENGINEER"), resolveIssue);
router.patch("/:issueId/close", authorizeProjectAccess("PROJECT_MANAGER"), closeIssue);

export default router;
