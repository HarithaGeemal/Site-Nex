import express from "express";
import protect from "../middlewares/authMiddleware.js";
import { loadUsageLog, authorizeProjectAccess, authorizeGlobalRole } from "../middlewares/rbacMiddleware.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import {
    createMaterialItemSchema,
    addStockMovementSchema,
    logUsageSchema,
    idParamSchema,
    usageLogIdParamSchema,
    getMovementsByMaterialQuerySchema,
    getUsageByTaskQuerySchema
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
// project scoped middlewares (protect, id param validation, loadProject) are handled in server.js now
router.post("/stock-movements", validateRequest({ body: addStockMovementSchema }), authorizeProjectAccess("STORE_KEEPER"), addStockMovement);
router.get("/stock-movements", authorizeProjectAccess("STORE_KEEPER"), getMovementsByProject);
router.get("/stock-movements/by-material", validateRequest({ query: getMovementsByMaterialQuerySchema }), authorizeProjectAccess("STORE_KEEPER"), getMovementsByMaterial);

// ── Usage Logs (project-scoped) ──────────────────────────────────────
router.post("/usage-logs", validateRequest({ body: logUsageSchema }), authorizeProjectAccess("STORE_KEEPER"), logUsage);
router.get("/usage-logs", authorizeProjectAccess("STORE_KEEPER"), getUsageByProject);
router.get("/usage-logs/by-task", validateRequest({ query: getUsageByTaskQuerySchema }), authorizeProjectAccess("STORE_KEEPER"), getUsageByTask);

// Voiding usage targets a specific usage log, so it loads the log (which loads the project implicitly if needed, but project already loaded in server loop)
router.patch("/usage-logs/:usageLogId/void", validateRequest({ params: usageLogIdParamSchema }), loadUsageLog, authorizeProjectAccess("STORE_KEEPER"), voidUsage);

export default router;
