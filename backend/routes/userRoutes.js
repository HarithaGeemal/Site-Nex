import express from "express";
import {
    registerUser,
    getUserData,
    updateMyProfile,
    getAllUsers,
    getUserById,
    updateUser,
    toggleActiveStatus,
} from "../controllers/userController.js";

// TODO: import auth & role middlewares once created
// import { protect } from "../middlewares/authMiddleware.js";
// import { authorizeRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Admin — register / onboard a new staff member
router.post("/register", /* protect, authorizeRoles("ADMIN"), */ registerUser);

// Private — logged-in user's own profile
router.get("/me", /* protect, */ getUserData);
router.put("/me", /* protect, */ updateMyProfile);

// Admin — manage all users
router.get("/", /* protect, authorizeRoles("ADMIN"), */ getAllUsers);           // ?userRole=&isActive=
router.get("/:id", /* protect, authorizeRoles("ADMIN"), */ getUserById);
router.put("/:id", /* protect, authorizeRoles("ADMIN"), */ updateUser);
router.patch("/:id/toggle-status", /* protect, authorizeRoles("ADMIN"), */ toggleActiveStatus);

export default router;
