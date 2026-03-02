import express from "express";
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

router.post("/", /* protect, */ createIssue);
router.get("/", /* protect, */ getIssuesByProject);      // ?projectId=xxx&status=Open&priority=High
router.get("/:id", /* protect, */ getIssueById);
router.put("/:id", /* protect, */ updateIssue);
router.patch("/:id/assign", /* protect, */ assignIssue);
router.patch("/:id/resolve", /* protect, */ resolveIssue);
router.patch("/:id/close", /* protect, */ closeIssue);

export default router;
