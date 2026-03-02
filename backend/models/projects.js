import mongoose from "mongoose";

const projectMemberSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
        role: {
            type: String,
            enum: ["PROJECT_MANAGER", "SITE_ENGINEER", "ASSISTANT_ENGINEER", "STORE_KEEPER"],
            required: true,
        },
        isPrimary: { type: Boolean, default: false }, 
    },
    { _id: false }
);

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

        members: { type: [projectMemberSchema], default: [] },
    },
    { timestamps: true }
);

export default mongoose.model("projects", projectSchema);