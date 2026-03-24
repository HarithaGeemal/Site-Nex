import ToolCheckout from "../models/toolCheckout.js";
import Tool from "../models/tool.js";

// @desc    Get all checkouts for project
// @route   GET /api/projects/:projectId/checkouts
// @access  Private
export const getCheckouts = async (req, res) => {
    try {
        const checkouts = await ToolCheckout.find({ projectId: req.project._id })
            .populate("toolId", "name serialNumber condition isBlacklisted")
            .populate("taskId", "name status")
            .populate("issuedTo", "name email")
            .populate("issuedBy", "name email")
            .populate("receivedBy", "name email")
            .sort({ checkoutDate: -1 });
        return res.status(200).json({ success: true, checkouts });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single checkout
// @route   GET /api/projects/:projectId/checkouts/:checkoutId
// @access  Private
export const getCheckoutById = async (req, res) => {
    try {
        const checkout = await ToolCheckout.findOne({ _id: req.params.checkoutId, projectId: req.project._id })
            .populate("toolId", "name serialNumber condition")
            .populate("taskId", "name")
            .populate("issuedTo", "name email");
        if (!checkout) return res.status(404).json({ success: false, message: "Checkout not found" });
        return res.status(200).json({ success: true, checkout });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create a Tool Checkout
// @route   POST /api/projects/:projectId/checkouts
// @access  Store Keeper / PM
export const createCheckout = async (req, res) => {
    try {
        const { toolId, taskId, issuedTo, expectedReturnDate, notes } = req.body;

        if (taskId) {
            const Task = (await import("../models/task.js")).default;
            const taskExists = await Task.exists({ _id: taskId, projectId: req.project._id });
            if (!taskExists) return res.status(400).json({ success: false, message: "Task does not belong to this project" });
        }

        // Verify the user receiving the tool actually belongs to this specific project
        const ProjectMembership = (await import("../models/projectMembership.js")).default;
        const membership = await ProjectMembership.findOne({
            projectId: req.project._id,
            userId: issuedTo,
            removedAt: null
        });
        
        if (!membership) {
            return res.status(403).json({ success: false, message: "The user receiving this equipment is not an active member of this project."});
        }

        // 1. Verify the Tool exists and belongs to the project
        const tool = await Tool.findOne({ _id: toolId, projectId: req.project._id });
        if (!tool) return res.status(404).json({ success: false, message: "Tool not found" });

        // 2. CHECK BLACKLIST STATUS (Safety Officer feature tie-in)
        if (tool.isBlacklisted) {
            return res.status(422).json({ 
                success: false, 
                message: "Checkout blocked. This tool has been blacklisted for safety reasons by the Safety Officer." 
            });
        }

        // 3. Check inventory availability
        if (tool.availableQuantity < 1) {
            return res.status(422).json({ success: false, message: "Checkout blocked. This tool is out of stock (availableQuantity is 0)." });
        }

        // 4. Record Checkout
        const checkout = await ToolCheckout.create({
            projectId: req.project._id,
            toolId,
            taskId,
            issuedTo,
            issuedBy: req.user._id, // The store keeper doing the checkout
            expectedReturnDate,
            notes
        });

        // 5. Deduct stock dynamically
        tool.availableQuantity -= 1;
        await tool.save();

        return res.status(201).json({ success: true, message: "Tool checked out successfully", checkout });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Return a Checked-out Tool
// @route   PUT /api/projects/:projectId/checkouts/:checkoutId/return
// @access  Store Keeper / PM
export const returnTool = async (req, res) => {
    try {
        const { returnCondition, notes } = req.body;
        
        const checkout = await ToolCheckout.findOne({ _id: req.params.checkoutId, projectId: req.project._id });
        if (!checkout) return res.status(404).json({ success: false, message: "Checkout not found" });
        if (checkout.status === "Returned") return res.status(400).json({ success: false, message: "Tool is already returned" });

        const tool = await Tool.findById(checkout.toolId);
        if (!tool) return res.status(404).json({ success: false, message: "Underlying Tool vanished from registry" });

        // 1. Update Checkout Entry
        checkout.status = "Returned";
        checkout.returnDate = new Date();
        checkout.returnCondition = returnCondition;
        checkout.receivedBy = req.user._id;
        if (notes) checkout.notes = (checkout.notes ? checkout.notes + "\n" : "") + "Return notes: " + notes;
        
        await checkout.save();

        // 2. Increment stock and potentially update tool condition locally
        tool.availableQuantity += 1;
        if (returnCondition === "Damaged" || returnCondition === "Poor") {
            tool.condition = returnCondition; 
            // We do NOT auto-blacklist it. We leave it to the Safety Officer to assess damage!
        } else {
            tool.condition = returnCondition;
        }
        await tool.save();

        return res.status(200).json({ success: true, message: "Tool successfully returned to inventory", checkout });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Delete a checkout record
// @route   DELETE /api/projects/:projectId/checkouts/:checkoutId
// @access  PM / Admin
// Not commonly done, usually archived. But providing a hard delete route via StoreService
import StoreService from "../services/storeService.js";

export const deleteCheckout = async (req, res) => {
    try {
        // Implement later if required. For now, basic delete.
        await ToolCheckout.deleteOne({ _id: req.params.checkoutId, projectId: req.project._id });
        return res.status(200).json({ success: true, message: "Checkout record logically deleted" });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};
