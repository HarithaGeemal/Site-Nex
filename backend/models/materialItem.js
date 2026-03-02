import mongoose from "mongoose";

const materialItemSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        category: {
            type: String,
            enum: ["Structural", "Electrical", "Plumbing", "Finishing", "Other"],
            default: "Other",
        },
        unit: { type: String, required: true, trim: true }, // kg, m, pcs, litres
        defaultUnitCost: { type: Number, min: 0, default: 0 },
        minStockThreshold: { type: Number, min: 0, default: 0 },
        isArchived: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// prevent duplicate material names globally
materialItemSchema.index({ name: 1 }, { unique: true });

export default mongoose.model("material_items", materialItemSchema);