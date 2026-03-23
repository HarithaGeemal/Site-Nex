import mongoose from "mongoose";

const safetyNoticeSchema = new mongoose.Schema(
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
        },
        location: { type: String },
        reason: { type: String, required: true },
        status: {
            type: String,
            enum: ["Active", "Lifted"],
            default: "Active"
        },
        issuedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        liftedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        liftedAt: { type: Date }
    },
    { timestamps: true }
);

export default mongoose.model("SafetyNotice", safetyNoticeSchema);
