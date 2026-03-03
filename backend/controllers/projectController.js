import mongoose from "mongoose";
import Project from "../models/projects.js";
import ProjectMembership from "../models/projectMembership.js";
import ProjectService from "../services/projectService.js";
import Task from "../models/task.js";
import Issue from "../models/issue.js";
import User from "../models/users.js";
import TaskAssignment from "../models/taskAssignment.js";

const MEMBER_ROLES = ["PROJECT_MANAGER", "SITE_ENGINEER", "ASSISTANT_ENGINEER", "STORE_KEEPER"];

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// @desc    Create a new project
// @route   POST /api/projects
// @access  Admin
export const createProject = async (req, res) => {
    try {
        const { name, location, startDate, endDate, description, budget, status, progress } = req.body;

        const project = await Project.create({
            name,
            location,
            startDate,
            endDate,
            description,
            budget,
            status,
            progress,
        });

        // Automatically add the creator as the OWNER
        await ProjectMembership.create({
            projectId: project._id,
            userId: req.user._id,
            role: "OWNER",
            isPrimary: true
        });

        return res.status(201).json({ success: true, message: "Project created successfully", project });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
export const getAllProjects = async (req, res) => {
    try {
        // ADMIN sees all projects; other roles see only projects they are members of
        const filter = { isDeleted: false };
        if (req.user.userRole !== "ADMIN") {
            // Find projects this user belongs to
            const memberships = await ProjectMembership.find({ userId: req.user._id, removedAt: null }).select("projectId");
            const projectIds = memberships.map(m => m.projectId);
            filter._id = { $in: projectIds };
        }

        const projects = await Project.find(filter).sort({ createdAt: -1 });

        return res.status(200).json({ success: true, projects });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Admin / Project Manager
export const getProjectById = async (req, res) => {
    try {
        // req.project is already loaded by loadProject middleware
        const project = req.project.toObject();

        // Fetch active members mapped dynamically
        const memberships = await ProjectMembership.find({ projectId: project._id, removedAt: null }).populate("userId", "name email userRole phone");
        project.members = memberships.map(m => ({
            userId: m.userId,
            role: m.role,
            isPrimary: m.isPrimary,
            joinedAt: m.joinedAt
        }));

        return res.status(200).json({ success: true, project });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Admin / Project Manager
export const updateProject = async (req, res) => {
    try {

        // Do not allow manual status or progress updates here — they are calculated dynamically via tasks/issues
        const { name, location, startDate, endDate, description, budget } = req.body;

        // Only update defined fields
        if (name !== undefined) req.project.name = name;
        if (location !== undefined) req.project.location = location;
        if (startDate !== undefined) req.project.startDate = startDate;
        if (endDate !== undefined) req.project.endDate = endDate;
        if (description !== undefined) req.project.description = description;
        if (budget !== undefined) req.project.budget = budget;

        await req.project.save();

        return res.status(200).json({ success: true, message: "Project updated successfully (progress/status are auto-calculated)", project: req.project });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Soft-delete a project (marks isDeleted = true)
// @route   DELETE /api/projects/:id
// @access  Admin
export const deleteProject = async (req, res) => {
    try {
        await ProjectService.deleteProject(req.project._id, req.user._id);

        return res.status(200).json({ success: true, message: "Project deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Add a member to a project
// @route   POST /api/projects/:id/members
// @access  Admin / Project Manager
export const addMember = async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ success: false, message: "Invalid project ID" });
        }

        const { userId, role, isPrimary } = req.body;

        if (!MEMBER_ROLES.includes(role)) {
            return res.status(400).json({ success: false, message: `Invalid role. Must be one of: ${MEMBER_ROLES.join(", ")}` });
        }

        // Verify the user actually exists in the DB
        const userExists = await User.findOne({ _id: userId, isActive: true });
        if (!userExists) return res.status(404).json({ success: false, message: "User not found or inactive" });

        // Warn if membership exists
        const existingMembership = await ProjectMembership.findOne({ projectId: req.project._id, userId, removedAt: null });
        if (existingMembership) {
            return res.status(409).json({ success: false, message: "User is already an active member of this project" });
        }

        // Prevent multiple isPrimary members for the same role
        if (isPrimary) {
            const hasExistingPrimary = await ProjectMembership.findOne({ projectId: req.project._id, role, isPrimary: true, removedAt: null });
            if (hasExistingPrimary) {
                return res.status(409).json({ success: false, message: `There is already a primary ${role} on this project` });
            }
        }

        await ProjectMembership.create({
            projectId: req.project._id,
            userId,
            role,
            isPrimary: isPrimary || false
        });

        return res.status(200).json({ success: true, message: "Member added successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Remove a member from a project
// @route   DELETE /api/projects/:id/members/:userId
// @access  Admin / Project Manager
export const removeMember = async (req, res) => {
    try {
        const membership = await ProjectMembership.findOneAndUpdate(
            { projectId: req.project._id, userId: req.params.userId, removedAt: null },
            { removedAt: new Date() },
            { new: true }
        );

        if (!membership) {
            return res.status(404).json({ success: false, message: "User is not a member of this project" });
        }

        // CLEANUP: 1. Soft-remove all active task assignments for this user in this project
        const projectTasks = await Task.find({ projectId: req.project._id }).select("_id");
        const taskIds = projectTasks.map(t => t._id);

        if (taskIds.length > 0) {
            await TaskAssignment.updateMany(
                { taskId: { $in: taskIds }, userId: req.params.userId, removedAt: null },
                { removedAt: new Date(), removedReason: "User removed from project" }
            );
        }

        // CLEANUP: 2. Unassign the user from any open issues in this project
        await Issue.updateMany(
            { projectId: req.project._id, assignedTo: req.params.userId, status: { $nin: ["Resolved", "Closed"] } },
            { assignedTo: null, status: "Open" }
        );

        return res.status(200).json({ success: true, message: "Member removed and related assignments cleaned up successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
