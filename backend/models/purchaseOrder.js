import mongoose from "mongoose";

const purchaseOrderSchema = new mongoose.Schema(
    {
        poNumber: {
            type: String,
            required: true,
            unique: true
        },
        generatedAt: {
            type: Date,
            default: Date.now
        },
        generatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        items: [
            {
                materialItemId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "material_items",
                    required: true
                },
                currentStock: { type: Number, required: true },
                minThreshold: { type: Number, required: true },
                requiredQuantity: { type: Number, required: true },
                orderedQuantity: { type: Number }
            }
        ],
        status: {
            type: String,
            enum: ["Draft", "Ordered", "Received", "Cancelled"],
            default: "Draft"
        },
        notes: {
            type: String
        }
    },
    { timestamps: true }
);

export default mongoose.model("purchase_orders", purchaseOrderSchema);
