import mongoose from "mongoose";
import MaterialItem from "../models/materialItem.js";
import MaterialStockMovement from "../models/materialStockMovement.js";
import MaterialUsageLog from "../models/materialUsageLog.js";
import MaterialService from "../services/materialService.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// ─── Material Items ───────────────────────────────────────────────────────────

// @desc    Create a new material item in the catalog
// @route   POST /api/materials/items
// @access  Admin / Store Keeper
export const createMaterialItem = async (req, res) => {
    try {
        const { name, category, unit, defaultUnitCost, minStockThreshold } = req.body;

        if (!name || !unit) {
            return res.status(400).json({ success: false, message: "name and unit are required" });
        }

        const existing = await MaterialItem.findOne({ name: name.trim() });
        if (existing) {
            return res.status(409).json({ success: false, message: "A material item with this name already exists" });
        }

        const item = await MaterialItem.create({ name: name.trim(), category, unit, defaultUnitCost, minStockThreshold });

        return res.status(201).json({ success: true, message: "Material item created successfully", item });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all material items (optionally include archived)
// @route   GET /api/materials/items?includeArchived=true
// @access  Private
export const getAllMaterialItems = async (req, res) => {
    try {
        const { includeArchived } = req.query;
        const filter = includeArchived === "true" ? {} : { isArchived: false };

        const items = await MaterialItem.find(filter).sort({ name: 1 });

        return res.status(200).json({ success: true, items });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update a material item
// @route   PUT /api/materials/items/:id
// @access  Admin / Store Keeper
export const updateMaterialItem = async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ success: false, message: "Invalid material item ID" });
        }

        const { name, category, unit, defaultUnitCost, minStockThreshold } = req.body;

        const updates = {};
        if (name !== undefined) updates.name = name.trim();
        if (category !== undefined) updates.category = category;
        if (unit !== undefined) updates.unit = unit;
        if (defaultUnitCost !== undefined) updates.defaultUnitCost = defaultUnitCost;
        if (minStockThreshold !== undefined) updates.minStockThreshold = minStockThreshold;

        const item = await MaterialItem.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });

        if (!item) return res.status(404).json({ success: false, message: "Material item not found" });

        return res.status(200).json({ success: true, message: "Material item updated successfully", item });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Archive (soft-delete) a material item
// @route   PATCH /api/materials/items/:id/archive
// @access  Admin
export const archiveMaterialItem = async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ success: false, message: "Invalid material item ID" });
        }

        const item = await MaterialItem.findByIdAndUpdate(req.params.id, { isArchived: true }, { new: true });

        if (!item) return res.status(404).json({ success: false, message: "Material item not found" });

        return res.status(200).json({ success: true, message: "Material item archived successfully", item });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Stock Movements ──────────────────────────────────────────────────────────

// @desc    Record a stock movement (STOCK_IN / ADJUSTMENT / VOID_REVERT)
// @route   POST /api/materials/stock-movements
// @access  Store Keeper
export const addStockMovement = async (req, res) => {
    try {
        const { materialItemId, type, quantity, supplier, deliveryDate, unitCost, note } = req.body;
        const projectId = req.project._id;

        const movement = await MaterialService.addStockMovement(
            projectId,
            materialItemId,
            type,
            quantity,
            req.user._id,
            { supplier, deliveryDate, unitCost, note }
        );

        return res.status(201).json({ success: true, message: "Stock movement recorded successfully", movement });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all stock movements for a project
// @route   GET /api/materials/stock-movements?projectId=xxx
// @access  Private
export const getMovementsByProject = async (req, res) => {
    try {
        const projectId = req.project._id;

        const movements = await MaterialStockMovement.find({ projectId })
            .populate("materialItemId", "name unit category")
            .populate("createdBy", "name")
            .sort({ createdAt: -1 });

        return res.status(200).json({ success: true, movements });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get stock movements for a specific material in a project
// @route   GET /api/materials/stock-movements/by-material?projectId=xxx&materialItemId=yyy
// @access  Private
export const getMovementsByMaterial = async (req, res) => {
    try {
        const projectId = req.project._id;
        const { materialItemId } = req.query;

        if (!materialItemId) {
            return res.status(400).json({ success: false, message: "materialItemId is required" });
        }

        if (!isValidId(materialItemId)) {
            return res.status(400).json({ success: false, message: "Invalid materialItemId" });
        }

        const movements = await MaterialStockMovement.find({ projectId, materialItemId })
            .populate("materialItemId", "name unit")
            .populate("createdBy", "name")
            .sort({ createdAt: -1 });

        return res.status(200).json({ success: true, movements });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Usage Logs ───────────────────────────────────────────────────────────────

// @desc    Log material usage against a task (atomic — prevents negative stock race condition)
// @route   POST /api/materials/usage-logs
// @access  Site Engineer / Store Keeper
export const logUsage = async (req, res) => {
    try {
        const { taskId, materialItemId, quantityUsed, usageDate } = req.body;
        const projectId = req.project._id;

        const result = await MaterialService.logUsage(
            projectId,
            taskId,
            materialItemId,
            quantityUsed,
            req.user._id,
            usageDate
        );

        return res.status(201).json({
            success: true,
            message: "Usage logged successfully",
            log: result.log,
            remainingStock: result.remainingStock,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all non-voided usage logs for a project
// @route   GET /api/materials/usage-logs?projectId=xxx
// @access  Private
export const getUsageByProject = async (req, res) => {
    try {
        const projectId = req.project._id;

        const logs = await MaterialUsageLog.find({ projectId, isVoided: false })
            .populate("materialItemId", "name unit category")
            .populate("taskId", "name status")
            .populate("createdBy", "name")
            .sort({ usageDate: -1 });

        return res.status(200).json({ success: true, logs });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get usage logs for a specific task
// @route   GET /api/materials/usage-logs/by-task?projectId=xxx&taskId=yyy
// @access  Private
export const getUsageByTask = async (req, res) => {
    try {
        const projectId = req.project._id;
        const { taskId } = req.query;

        if (!taskId) {
            return res.status(400).json({ success: false, message: "taskId is required" });
        }

        if (!isValidId(taskId)) {
            return res.status(400).json({ success: false, message: "Invalid taskId" });
        }

        const logs = await MaterialUsageLog.find({ projectId, taskId, isVoided: false })
            .populate("materialItemId", "name unit category")
            .populate("createdBy", "name")
            .sort({ usageDate: -1 });

        return res.status(200).json({ success: true, logs });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Void a usage log entry (restores stock)
// @route   PATCH /api/materials/usage-logs/:id/void
// @access  Admin / Store Keeper
export const voidUsage = async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ success: false, message: "Invalid usage log ID" });
        }

        const { voidReason } = req.body;

        const log = await MaterialService.voidUsage(req.params.usageLogId, voidReason, req.user._id);

        return res.status(200).json({ success: true, message: "Usage log voided and stock restored successfully", log });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
