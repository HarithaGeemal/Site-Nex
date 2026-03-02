import express from "express";
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

// ── Material Catalog Items ──────────────────────────────────────────
router.post("/items", /* protect, */ createMaterialItem);
router.get("/items", /* protect, */ getAllMaterialItems);          // ?includeArchived=true
router.put("/items/:id", /* protect, */ updateMaterialItem);
router.patch("/items/:id/archive", /* protect, */ archiveMaterialItem);

// ── Stock Movements ─────────────────────────────────────────────────
router.post("/stock-movements", /* protect, */ addStockMovement);
router.get("/stock-movements", /* protect, */ getMovementsByProject);   // ?projectId=xxx
router.get("/stock-movements/by-material", /* protect, */ getMovementsByMaterial); // ?projectId=xxx&materialItemId=yyy

// ── Usage Logs ──────────────────────────────────────────────────────
router.post("/usage-logs", /* protect, */ logUsage);
router.get("/usage-logs", /* protect, */ getUsageByProject);      // ?projectId=xxx
router.get("/usage-logs/by-task", /* protect, */ getUsageByTask); // ?projectId=xxx&taskId=yyy
router.patch("/usage-logs/:id/void", /* protect, */ voidUsage);

export default router;
