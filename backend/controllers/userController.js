import User from "../models/users.js";

export const registerUser = async (req, res) => {
    try {
        const { userId, name, email, password, userRole, phone, nic } = req.body;

        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            res.json({ success: false, message: "Email is already registered" });
            return;
        }

        const existingUserId = await User.findOne({ userId });
        if (existingUserId) {
            res.json({ success: false, message: "UserId is already in use" });
            return;
        }

        const user = await User.create({ userId, name, email, password, userRole, phone, nic });

        res.json({ success: true, message: "User registered successfully", user });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const getUserData = async (req, res) => {
    try {
        const userId = req.user.userId;

        const user = await User.findOne({ userId });
        if (!user) {
            res.json({ success: false, message: "User not found" });
            return;
        }

        res.json({ success: true, message: "User fetched successfully", user });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const updateMyProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { name, phone, nic } = req.body;

        const user = await User.findOneAndUpdate(
            { userId },
            { name, phone, nic },
            { new: true, runValidators: true }
        );

        if (!user) {
            res.json({ success: false, message: "User not found" });
            return;
        }

        res.json({ success: true, message: "Profile updated successfully", user });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const { userRole, isActive } = req.query;

        const filter = {};
        if (userRole) filter.userRole = userRole;
        if (isActive !== undefined) filter.isActive = isActive === "true";

        const users = await User.find(filter).sort({ createdAt: -1 });

        res.json({ success: true, users });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            res.json({ success: false, message: "User not found" });
            return;
        }

        res.json({ success: true, user });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { name, userRole, phone, nic } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { name, userRole, phone, nic },
            { new: true, runValidators: true }
        );

        if (!user) {
            res.json({ success: false, message: "User not found" });
            return;
        }

        res.json({ success: true, message: "User updated successfully", user });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const toggleActiveStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            res.json({ success: false, message: "User not found" });
            return;
        }

        user.isActive = !user.isActive;
        await user.save();

        res.json({
            success: true,
            message: `User ${user.isActive ? "activated" : "deactivated"} successfully`,
            user,
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};