import express from "express";
import {
    createProject,
    getAllProjects,
    getProjectById,
    updateProject,
    deleteProject,
    addMember,
    removeMember,
} from "../controllers/projectController.js";

const router = express.Router();

router.post("/", /* protect, authorizeRoles("ADMIN"), */ createProject);
router.get("/", /* protect, */ getAllProjects);
router.get("/:id", /* protect, */ getProjectById);
router.put("/:id", /* protect, authorizeRoles("ADMIN", "PROJECT_MANAGER"), */ updateProject);
router.delete("/:id", /* protect, authorizeRoles("ADMIN"), */ deleteProject);

router.post("/:id/members", /* protect, authorizeRoles("ADMIN", "PROJECT_MANAGER"), */ addMember);
router.delete("/:id/members/:userId", /* protect, authorizeRoles("ADMIN", "PROJECT_MANAGER"), */ removeMember);

export default router;
