import mongoose from "mongoose";

const materialRequestSchema = new mongoose.Schema(
    {
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "projects",
            required: true,
            index: true
        },
        taskId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "tasks",
            required: true
        },
        requestedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        materialItemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "material_items",
            required: true
        },
        requestedQuantity: {
            type: Number,
            required: true,
            min: 0.1
        },
        status: {
            type: String,
            enum: ["Pending", "Approved", "Denied"],
            default: "Pending"
        },
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        notes: {
            type: String
        }
    },
    { timestamps: true }
);

export default mongoose.model("material_requests", materialRequestSchema);
