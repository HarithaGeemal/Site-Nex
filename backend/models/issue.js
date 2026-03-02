import mongoose from "mongoose";

const issueSchema = new mongoose.Schema(
    {
        issueTitle: { type: String, required: true, trim: true },

        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "projects",
            required: true,
        },

        taskId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "tasks",
            default: null,
        },

        description: { type: String, required: true, trim: true },

        status: {
            type: String,
            enum: ["Open", "Assigned", "In Progress", "Resolved", "Closed"],
            default: "Open",
        },

        priority: {
            type: String,
            enum: ["Low", "Medium", "High", "Critical"],
            default: "Low",
        },

        dueDate: { type: Date },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },

        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            default: null,
        },

        resolutionNote: { type: String, trim: true },
        resolvedAt: { type: Date },
        closedAt: { type: Date },
    },
    { timestamps: true }
);

//  index for filtering
issueSchema.index({ projectId: 1, status: 1, priority: 1 });

export default mongoose.model("issues", issueSchema);