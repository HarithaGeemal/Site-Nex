import MaterialItem from "../models/materialItem.js";
import MaterialStockMovement from "../models/materialStockMovement.js";
import MaterialUsageLog from "../models/materialUsageLog.js";

// ─── Material Items ───────────────────────────────────────────────────────────

export const createMaterialItem = async (req, res) => {
    try {
        const { name, category, unit, defaultUnitCost, minStockThreshold } = req.body;

        const existing = await MaterialItem.findOne({ name });
        if (existing) {
            res.json({ success: false, message: "A material item with this name already exists" });
            return;
        }

        const item = await MaterialItem.create({ name, category, unit, defaultUnitCost, minStockThreshold });

        res.json({ success: true, message: "Material item created successfully", item });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const getAllMaterialItems = async (req, res) => {
    try {
        const { includeArchived } = req.query;
        const filter = includeArchived === "true" ? {} : { isArchived: false };

        const items = await MaterialItem.find(filter).sort({ name: 1 });

        res.json({ success: true, items });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const updateMaterialItem = async (req, res) => {
    try {
        const { name, category, unit, defaultUnitCost, minStockThreshold } = req.body;

        const item = await MaterialItem.findByIdAndUpdate(
            req.params.id,
            { name, category, unit, defaultUnitCost, minStockThreshold },
            { new: true, runValidators: true }
        );

        if (!item) {
            res.json({ success: false, message: "Material item not found" });
            return;
        }

        res.json({ success: true, message: "Material item updated successfully", item });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const archiveMaterialItem = async (req, res) => {
    try {
        const item = await MaterialItem.findByIdAndUpdate(
            req.params.id,
            { isArchived: true },
            { new: true }
        );

        if (!item) {
            res.json({ success: false, message: "Material item not found" });
            return;
        }

        res.json({ success: true, message: "Material item archived successfully", item });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ─── Stock Movements ──────────────────────────────────────────────────────────

export const addStockMovement = async (req, res) => {
    try {
        const { projectId, materialItemId, type, quantity, supplier, deliveryDate, unitCost, note } = req.body;

        const movement = await MaterialStockMovement.create({
            projectId,
            materialItemId,
            type,
            quantity,
            supplier,
            deliveryDate,
            unitCost,
            note,
            createdBy: req.user._id,
        });

        res.json({ success: true, message: "Stock movement recorded successfully", movement });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const getMovementsByProject = async (req, res) => {
    try {
        const { projectId } = req.query;

        if (!projectId) {
            res.json({ success: false, message: "projectId query parameter is required" });
            return;
        }

        const movements = await MaterialStockMovement.find({ projectId })
            .populate("materialItemId", "name unit category")
            .populate("createdBy", "name")
            .sort({ createdAt: -1 });

        res.json({ success: true, movements });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const getMovementsByMaterial = async (req, res) => {
    try {
        const { projectId, materialItemId } = req.query;

        if (!projectId || !materialItemId) {
            res.json({ success: false, message: "projectId and materialItemId are required" });
            return;
        }

        const movements = await MaterialStockMovement.find({ projectId, materialItemId })
            .populate("materialItemId", "name unit")
            .populate("createdBy", "name")
            .sort({ createdAt: -1 });

        res.json({ success: true, movements });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ─── Usage Logs ───────────────────────────────────────────────────────────────

export const logUsage = async (req, res) => {
    try {
        const { projectId, taskId, materialItemId, quantityUsed, usageDate } = req.body;

        const log = await MaterialUsageLog.create({
            projectId,
            taskId,
            materialItemId,
            quantityUsed,
            usageDate,
            createdBy: req.user._id,
        });

        res.json({ success: true, message: "Usage logged successfully", log });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const getUsageByProject = async (req, res) => {
    try {
        const { projectId } = req.query;

        if (!projectId) {
            res.json({ success: false, message: "projectId query parameter is required" });
            return;
        }

        const logs = await MaterialUsageLog.find({ projectId, isVoided: false })
            .populate("materialItemId", "name unit category")
            .populate("taskId", "name status")
            .populate("createdBy", "name")
            .sort({ usageDate: -1 });

        res.json({ success: true, logs });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const getUsageByTask = async (req, res) => {
    try {
        const { projectId, taskId } = req.query;

        if (!projectId || !taskId) {
            res.json({ success: false, message: "projectId and taskId are required" });
            return;
        }

        const logs = await MaterialUsageLog.find({ projectId, taskId, isVoided: false })
            .populate("materialItemId", "name unit category")
            .populate("createdBy", "name")
            .sort({ usageDate: -1 });

        res.json({ success: true, logs });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const voidUsage = async (req, res) => {
    try {
        const { voidReason } = req.body;

        const log = await MaterialUsageLog.findByIdAndUpdate(
            req.params.id,
            { isVoided: true, voidReason },
            { new: true }
        );

        if (!log) {
            res.json({ success: false, message: "Usage log not found" });
            return;
        }

        res.json({ success: true, message: "Usage log voided successfully", log });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
