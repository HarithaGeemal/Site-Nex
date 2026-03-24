import express from "express";
import {
    getCheckouts,
    getCheckoutById,
    createCheckout,
    returnTool,
    deleteCheckout
} from "../controllers/toolCheckoutController.js";
import { authorizeProjectAccess } from "../middlewares/rbacMiddleware.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import {
    createToolCheckoutSchema,
    returnToolCheckoutSchema,
    checkoutIdParamSchema
} from "../validations/schemas.js";

const router = express.Router({ mergeParams: true });

// Read access for everyone from Assistant Eng and up
router.use(authorizeProjectAccess("ASSISTANT_ENGINEER"));

router.route("/")
    .get(getCheckouts)
    .post(authorizeProjectAccess("STORE_KEEPER"), validateRequest({ body: createToolCheckoutSchema }), createCheckout);

// Returning a tool is a specific targeted update endpoint
router.route("/:checkoutId/return")
    .put(authorizeProjectAccess("STORE_KEEPER"), validateRequest({ params: checkoutIdParamSchema, body: returnToolCheckoutSchema }), returnTool);

router.route("/:checkoutId")
    .get(validateRequest({ params: checkoutIdParamSchema }), getCheckoutById)
    .delete(authorizeProjectAccess("PROJECT_MANAGER"), validateRequest({ params: checkoutIdParamSchema }), deleteCheckout);

export default router;
