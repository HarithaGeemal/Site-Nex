import mongoose from "mongoose";

const toolCheckoutSchema = new mongoose.Schema(
    {
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "projects",
            required: true,
            index: true
        },
        toolId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "tools",
            required: true
        },
        taskId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "tasks"
        },
        issuedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        issuedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        checkoutDate: {
            type: Date,
            default: Date.now,
            required: true
        },
        expectedReturnDate: {
            type: Date,
            required: true
        },
        status: {
            type: String,
            enum: ["Active", "Returned"],
            default: "Active"
        },
        returnDate: {
            type: Date
        },
        returnCondition: {
            type: String,
            enum: ["New", "Good", "Fair", "Poor", "Damaged"]
        },
        receivedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        notes: {
            type: String
        }
    },
    { timestamps: true }
);

export default mongoose.model("tool_checkouts", toolCheckoutSchema);
