import express from "express";
import protect from "../middlewares/authMiddleware.js";
import { loadProject, authorizeProjectAccess } from "../middlewares/rbacMiddleware.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import {
    createProjectSchema,
    updateProjectSchema,
    idParamSchema
} from "../validations/schemas.js";
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

// Only ADMIN maps globally
router.post("/", protect, validateRequest({ body: createProjectSchema }), createProject);

router.get("/", protect, getAllProjects); // Controller handles membership filter

// All down-line routes must load the project first
router.use("/:id", protect, validateRequest({ params: idParamSchema }), loadProject);

router.get("/:id", authorizeProjectAccess("STORE_KEEPER"), getProjectById);
router.put("/:id", validateRequest({ body: updateProjectSchema }), authorizeProjectAccess("PROJECT_MANAGER"), updateProject);
router.delete("/:id", authorizeProjectAccess("ADMIN"), deleteProject);

router.post("/:id/members", authorizeProjectAccess("PROJECT_MANAGER"), addMember);
router.delete("/:id/members/:userId", authorizeProjectAccess("PROJECT_MANAGER"), removeMember);

export default router;
