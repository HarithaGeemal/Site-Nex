import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
    {
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "projects",
            required: true,
        },

        name: { type: String, required: true },
        description: { type: String, required: true },

        status: {
            type: String,
            enum: ["Not Started", "In Progress", "Under Review", "Completed"],
            default: "Not Started",
        },

        priority: {
            type: String,
            enum: ["Low", "Medium", "High", "Critical"],
            default: "Low",
        },

        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },

        percentComplete: { type: Number, min: 0, max: 100, default: 0 },

        dependencyTaskIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "tasks" }],
        isCancled: { type: Boolean, default: false },
        cancellationReason: { type: String }

    },
    { timestamps: true }
);

export default mongoose.model("tasks", taskSchema);