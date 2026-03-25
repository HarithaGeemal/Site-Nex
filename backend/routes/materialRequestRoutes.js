import express from "express";
import {
    getMaterialRequests,
    getMaterialRequestById,
    createMaterialRequest,
    respondToMaterialRequest,
    addCommentToRequest
} from "../controllers/materialRequestController.js";
import { authorizeProjectAccess } from "../middlewares/rbacMiddleware.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import {
    createMaterialRequestSchema,
    respondMaterialRequestSchema,
    materialRequestIdParamSchema
} from "../validations/schemas.js";

const router = express.Router({ mergeParams: true });

// Read access for everyone from Assistant Eng and up
router.use(authorizeProjectAccess("ASSISTANT_ENGINEER"));

router.route("/")
    .get(getMaterialRequests)
    .post(authorizeProjectAccess("SITE_ENGINEER"), validateRequest({ body: createMaterialRequestSchema }), createMaterialRequest);

router.route("/:requestId")
    .get(validateRequest({ params: materialRequestIdParamSchema }), getMaterialRequestById);

// Store Keeper dedicated response endpoint
router.route("/:requestId/respond")
    .patch(
        authorizeProjectAccess("STORE_KEEPER"), 
        validateRequest({ params: materialRequestIdParamSchema, body: respondMaterialRequestSchema }), 
        respondToMaterialRequest
    );

// Comments endpoint (SE and Store Keeper can comment)
router.route("/:requestId/comments")
    .post(
        authorizeProjectAccess("SITE_ENGINEER"),
        addCommentToRequest
    );

export default router;
