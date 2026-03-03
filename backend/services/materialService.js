import mongoose from "mongoose";
import MaterialItem from "../models/materialItem.js";
import MaterialStockMovement from "../models/materialStockMovement.js";
import MaterialUsageLog from "../models/materialUsageLog.js";

/**
 * Service to handle transactional Material inventory operations.
 */
class MaterialService {
    /**
     * Adds a stock movement and updates the current stock cache transactionally.
     */
    static async addStockMovement(payload, userId) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const { projectId, materialItemId, type, quantity, supplier, deliveryDate, unitCost, note } = payload;

            const material = await MaterialItem.findOne({ _id: materialItemId, isArchived: false }).session(session);
            if (!material) throw new Error("Material item not found or is archived");

            const [movement] = await MaterialStockMovement.create(
                [{
                    projectId,
                    materialItemId,
                    type,
                    quantity,
                    supplier,
                    deliveryDate,
                    unitCost,
                    note,
                    createdBy: userId,
                }],
                { session }
            );

            await MaterialItem.findByIdAndUpdate(
                materialItemId,
                { $inc: { currentStock: quantity } },
                { session }
            );

            await session.commitTransaction();
            session.endSession();
            return movement;
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }

    /**
     * Logs usage against a task, decrementing stock transactionally, refusing if negative.
     */
    static async logUsage(payload, userId, task) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const { projectId, taskId, materialItemId, quantityUsed, usageDate } = payload;

            const material = await MaterialItem.findOne({ _id: materialItemId, isArchived: false }).session(session);
            if (!material) throw new Error("Material item not found or is archived");

            if (quantityUsed > material.currentStock) {
                throw new Error(`Insufficient stock. Available: ${material.currentStock} ${material.unit}, Requested: ${quantityUsed} ${material.unit}`);
            }

            const [log] = await MaterialUsageLog.create(
                [{ projectId, taskId, materialItemId, quantityUsed, usageDate, createdBy: userId }],
                { session }
            );

            await MaterialItem.findByIdAndUpdate(
                materialItemId,
                { $inc: { currentStock: -quantityUsed } },
                { session }
            );

            await session.commitTransaction();
            session.endSession();
            return { log, remainingStock: material.currentStock - quantityUsed };
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }

    /**
     * Voids a usage log and implicitly adds the stock back as a VOID_REVERT movement.
     */
    static async voidUsageLog(usageLogId, voidReason, userId) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const log = await MaterialUsageLog.findOneAndUpdate(
                { _id: usageLogId, isVoided: false },
                { isVoided: true, voidReason },
                { new: true, session }
            );

            if (!log) throw new Error("Usage log not found or already voided");

            await MaterialStockMovement.create(
                [{
                    projectId: log.projectId,
                    materialItemId: log.materialItemId,
                    type: "VOID_REVERT",
                    quantity: log.quantityUsed,
                    note: `Void revert for usage log ${log._id}. Reason: ${voidReason || "N/A"}`,
                    createdBy: userId,
                }],
                { session }
            );

            await MaterialItem.findByIdAndUpdate(
                log.materialItemId,
                { $inc: { currentStock: log.quantityUsed } },
                { session }
            );

            await session.commitTransaction();
            session.endSession();
            return log;
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }
}

export default MaterialService;
