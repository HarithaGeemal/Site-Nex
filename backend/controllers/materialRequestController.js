import MaterialRequest from "../models/materialRequest.js";
import MaterialService from "../services/materialService.js";

// @desc    Get all material requests for a project
// @route   GET /api/projects/:projectId/material-requests
// @access  Private
export const getMaterialRequests = async (req, res) => {
    try {
        const requests = await MaterialRequest.find({ projectId: req.project._id })
            .populate("taskId", "name status")
            .populate("requestedBy", "name")
            .populate("materialItemId", "name unit")
            .populate("toolId", "name serialNumber")
            .populate("approvedBy", "name")
            .sort({ createdAt: -1 });
        return res.status(200).json({ success: true, requests });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single material request
// @route   GET /api/projects/:projectId/material-requests/:requestId
// @access  Private
// ...
export const getMaterialRequestById = async (req, res) => {
    try {
        const request = await MaterialRequest.findOne({ _id: req.params.requestId, projectId: req.project._id })
            .populate("taskId", "name")
            .populate("materialItemId", "name unit")
            .populate("toolId", "name serialNumber")
            .populate("requestedBy", "name")
            .populate("approvedBy", "name");
        
        if (!request) return res.status(404).json({ success: false, message: "Request not found" });
        return res.status(200).json({ success: true, request });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Submit new Material/Tool Requests (Batch)
// @route   POST /api/projects/:projectId/material-requests
// @access  Site Engineer
export const createMaterialRequest = async (req, res) => {
    try {
        const { taskId, items, notes } = req.body; // items: [{ requestType, itemId, quantityRequested }]

        if (!taskId) {
            return res.status(400).json({ success: false, message: "A Target Task ID is strictly required." });
        }

        if (!items || !items.length) {
            return res.status(400).json({ success: false, message: "Please provide valid items to request." });
        }

        const requestDocs = items.map(item => {
            const doc = {
                projectId: req.project._id,
                taskId,
                requestedBy: req.user._id,
                requestType: item.requestType || "Material",
                requestedQuantity: item.quantityRequested,
                notes
            };
            if (doc.requestType === "Tool") {
                doc.toolId = item.itemId;
            } else {
                doc.materialItemId = item.itemId;
            }
            return doc;
        });

        const requests = await MaterialRequest.insertMany(requestDocs);

        return res.status(201).json({ success: true, message: "Requests submitted successfully", requests });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Respond to a Material Request (Approve / Deny)
// @route   PATCH /api/projects/:projectId/material-requests/:requestId/respond
// @access  Store Keeper
export const respondToMaterialRequest = async (req, res) => {
    try {
        const { status, notes } = req.body;
        
        const request = await MaterialRequest.findOne({ _id: req.params.requestId, projectId: req.project._id });
        if (!request) return res.status(404).json({ success: false, message: "Material Request not found" });
        
        if (request.status !== "Pending") {
            return res.status(400).json({ success: false, message: `Request is already ${request.status}` });
        }

        request.status = status;
        request.approvedBy = req.user._id;
        if (notes) request.notes = (request.notes ? request.notes + "\n" : "") + "Store Keeper Note: " + notes;

        // If Approved, automatically generate the UsageLog to securely deduct stock!
        if (status === "Approved") {
            try {
                // Let the MaterialService handle the transactional deduction safely
                await MaterialService.logUsage({
                    projectId: request.projectId,
                    taskId: request.taskId,
                    materialItemId: request.materialItemId,
                    quantityUsed: request.requestedQuantity,
                    usageDate: new Date()
                }, req.user._id);
            } catch (err) {
                // If it fails (e.g. insufficient stock), refuse to approve!
                return res.status(422).json({ success: false, message: "Approval Failed: " + err.message });
            }
        }

        await request.save();

        return res.status(200).json({ 
            success: true, 
            message: `Material request has been securely ${status}`,
            request 
        });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Add a comment to a Material Request
// @route   POST /api/projects/:projectId/material-requests/:requestId/comments
// @access  Site Engineer / Store Keeper
export const addCommentToRequest = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text || !text.trim()) {
            return res.status(400).json({ success: false, message: "Comment text is required." });
        }

        const request = await MaterialRequest.findOne({ _id: req.params.requestId, projectId: req.project._id });
        if (!request) return res.status(404).json({ success: false, message: "Material Request not found" });

        request.comments.push({
            text: text.trim(),
            createdBy: req.user._id
        });

        await request.save();

        // Re-fetch with populated comments
        const updated = await MaterialRequest.findById(request._id)
            .populate("comments.createdBy", "name email");

        return res.status(201).json({ success: true, message: "Comment added.", request: updated });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};
