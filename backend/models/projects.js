import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        location: { type: String, required: true },

        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },

        description: { type: String },
        budget: { type: Number, min: 0 },

        status: {
            type: String,
            enum: ["Planning", "Active", "On Hold", "Completed"],
            default: "Planning",
        },

        progress: { type: Number, min: 0, max: 100, default: 0 },

        isDeleted: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export default mongoose.model("projects", projectSchema);