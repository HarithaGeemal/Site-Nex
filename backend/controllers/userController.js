import mongoose from "mongoose";
import User from "../models/users.js";


const safeUser = (user) => {
    const obj = user.toObject();
    delete obj.__v;
    return obj;
};


const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);


export const registerUser = async (req, res) => {
    try {
        const { userId, name, email, userRole, phone, nic } = req.body;

        if (!userId || !name || !email || !userRole) {
            return res.status(400).json({ success: false, message: "userId, name, email and userRole are required" });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const [existingEmail, existingUserId] = await Promise.all([
            User.findOne({ email: normalizedEmail }),
            User.findOne({ userId }),
        ]);

        if (existingEmail) return res.status(409).json({ success: false, message: "Email is already registered in the system" });
        if (existingUserId) return res.status(409).json({ success: false, message: "UserId (Clerk ID) is already in use" });

        const user = await User.create({
            userId,
            name: name.trim(),
            email: normalizedEmail,
            userRole,
            phone,
            nic,
        });

        return res.status(201).json({ success: true, message: "User registered successfully", user: safeUser(user) });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};



export const syncUser = async (req, res) => {
    try {

        let user = await User.findOne({ userId: req.auth.userId });

        if (!user) {
            // First time login auto-provisioning
            // We need email and name from frontend or Clerk API
            const { name, email } = req.body;
            if (!email || !name) {
                return res.status(400).json({ success: false, message: "Name and email required for first-time sync" });
            }

            user = await User.create({
                userId: req.auth.userId,
                name,
                email: email.toLowerCase().trim(),
                userRole: "SITE_ENGINEER", // Default role, admin can elevate later
            });
        }

        // Update last login
        user.lastLoginAt = new Date();
        await user.save();

        return res.status(200).json({ success: true, message: "User synced", user: safeUser(user) });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};


export const getUserData = async (req, res) => {
    try {
        // req.user is already attached by protect middleware — no re-query needed
        return res.status(200).json({ success: true, user: safeUser(req.user) });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update own profile (name, phone, nic only)
// @route   PUT /api/users/me
// @access  Private
export const updateMyProfile = async (req, res) => {
    try {
        const { name, phone, nic } = req.body;

        // Build update object — only include defined fields to prevent overwriting with undefined
        const updates = {};
        if (name !== undefined) updates.name = name.trim();
        if (phone !== undefined) updates.phone = phone;
        if (nic !== undefined) updates.nic = nic;

        const user = await User.findByIdAndUpdate(
            req.user._id,  // Mongo _id from protect middleware
            updates,
            { new: true, runValidators: true }
        );

        return res.status(200).json({ success: true, message: "Profile updated successfully", user: safeUser(user) });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all users (filterable by role / isActive)
// @route   GET /api/users?userRole=PROJECT_MANAGER&isActive=true
// @access  Admin
export const getAllUsers = async (req, res) => {
    try {
        const { userRole, isActive } = req.query;

        const filter = {};
        if (userRole) filter.userRole = userRole;
        if (isActive !== undefined) filter.isActive = isActive === "true";

        const users = await User.find(filter).sort({ createdAt: -1 });

        return res.status(200).json({ success: true, users });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get a single user by Mongo _id
// @route   GET /api/users/:id
// @access  Admin
export const getUserById = async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ success: false, message: "Invalid user ID" });
        }

        const user = await User.findById(req.params.id).select("-password");

        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        return res.status(200).json({ success: true, user });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Admin updates any user's details
// @route   PUT /api/users/:id
// @access  Admin
export const updateUser = async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ success: false, message: "Invalid user ID" });
        }

        const { name, userRole, phone, nic } = req.body;

        // Only update defined fields
        const updates = {};
        if (name !== undefined) updates.name = name.trim();
        if (userRole !== undefined) updates.userRole = userRole;
        if (phone !== undefined) updates.phone = phone;
        if (nic !== undefined) updates.nic = nic;

        const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).select("-password");

        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        return res.status(200).json({ success: true, message: "User updated successfully", user });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Toggle a user's active / inactive status
// @route   PATCH /api/users/:id/toggle-status
// @access  Admin
export const toggleActiveStatus = async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ success: false, message: "Invalid user ID" });
        }

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        user.isActive = !user.isActive;
        await user.save();

        return res.status(200).json({
            success: true,
            message: `User ${user.isActive ? "activated" : "deactivated"} successfully`,
            user: safeUser(user),
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};