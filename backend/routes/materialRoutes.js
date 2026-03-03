import express from "express";
import protect from "../middlewares/authMiddleware.js";
import { loadProject, loadUsageLog, authorizeProjectAccess, authorizeGlobalRole } from "../middlewares/rbacMiddleware.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import {
    createMaterialItemSchema,
    addStockMovementSchema,
    logUsageSchema,
    idParamSchema,
    projectIdParamSchema
} from "../validations/schemas.js";
import {
    createMaterialItem,
    getAllMaterialItems,
    updateMaterialItem,
    archiveMaterialItem,
    addStockMovement,
    getMovementsByProject,
    getMovementsByMaterial,
    logUsage,
    getUsageByProject,
    getUsageByTask,
    voidUsage,
} from "../controllers/materialController.js";

const router = express.Router();

// ── Material Catalog (global, not project-scoped) ────────────────────
router.post("/items", protect, authorizeGlobalRole("ADMIN", "STORE_KEEPER"), validateRequest({ body: createMaterialItemSchema }), createMaterialItem);
router.get("/items", protect, getAllMaterialItems);
router.put("/items/:id", protect, authorizeGlobalRole("ADMIN", "STORE_KEEPER"), validateRequest({ params: idParamSchema }), updateMaterialItem);
router.patch("/items/:id/archive", protect, authorizeGlobalRole("ADMIN"), validateRequest({ params: idParamSchema }), archiveMaterialItem);

// ── Stock Movements (project-scoped) ─────────────────────────────────
router.post("/project/:projectId/stock-movements", protect, validateRequest({ params: projectIdParamSchema, body: addStockMovementSchema }), loadProject, authorizeProjectAccess("STORE_KEEPER"), addStockMovement);
router.get("/project/:projectId/stock-movements", protect, validateRequest({ params: projectIdParamSchema }), loadProject, authorizeProjectAccess("STORE_KEEPER"), getMovementsByProject);
router.get("/project/:projectId/stock-movements/by-material", protect, validateRequest({ params: projectIdParamSchema }), loadProject, authorizeProjectAccess("STORE_KEEPER"), getMovementsByMaterial);

// ── Usage Logs (project-scoped) ──────────────────────────────────────
router.post("/project/:projectId/usage-logs", protect, validateRequest({ params: projectIdParamSchema, body: logUsageSchema }), loadProject, authorizeProjectAccess("SITE_ENGINEER", "STORE_KEEPER"), logUsage);
router.get("/project/:projectId/usage-logs", protect, validateRequest({ params: projectIdParamSchema }), loadProject, authorizeProjectAccess("STORE_KEEPER"), getUsageByProject);
router.get("/project/:projectId/usage-logs/by-task", protect, validateRequest({ params: projectIdParamSchema }), loadProject, authorizeProjectAccess("STORE_KEEPER"), getUsageByTask);

// Voiding usage targets a specific usage log, so it loads the log (which loads the project)
router.patch("/usage-logs/:usageLogId/void", protect, validateRequest({ params: idParamSchema }), loadUsageLog, authorizeProjectAccess("STORE_KEEPER"), voidUsage);

export default router;
