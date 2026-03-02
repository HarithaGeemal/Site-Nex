import Project from "../models/projects.js";

export const createProject = async (req, res) => {
    try {
        const { name, location, startDate, endDate, description, budget, status, progress, members } = req.body;

        const project = await Project.create({
            name,
            location,
            startDate,
            endDate,
            description,
            budget,
            status,
            progress,
            members: members || [],
        });

        res.json({ success: true, message: "Project created successfully", project });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};


export const getAllProjects = async (req, res) => {
    try {
        const projects = await Project.find()
            .populate("members.userId", "name email userRole phone")
            .sort({ createdAt: -1 });

        res.json({ success: true, projects });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};


export const getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate("members.userId", "name email userRole phone");

        if (!project) {
            res.json({ success: false, message: "Project not found" });
            return;
        }

        res.json({ success: true, project });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const updateProject = async (req, res) => {
    try {
        const { name, location, startDate, endDate, description, budget, status, progress } = req.body;

        const project = await Project.findByIdAndUpdate(
            req.params.id,
            { name, location, startDate, endDate, description, budget, status, progress },
            { new: true, runValidators: true }
        );

        if (!project) {
            res.json({ success: false, message: "Project not found" });
            return;
        }

        res.json({ success: true, message: "Project updated successfully", project });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const deleteProject = async (req, res) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);

        if (!project) {
            res.json({ success: false, message: "Project not found" });
            return;
        }

        res.json({ success: true, message: "Project deleted successfully" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const addMember = async (req, res) => {
    try {
        const { userId, role, isPrimary } = req.body;

        const project = await Project.findById(req.params.id);
        if (!project) {
            res.json({ success: false, message: "Project not found" });
            return;
        }

        const alreadyMember = project.members.some((m) => m.userId.toString() === userId);
        if (alreadyMember) {
            res.json({ success: false, message: "User is already a member of this project" });
            return;
        }

        project.members.push({ userId, role, isPrimary: isPrimary || false });
        await project.save();

        res.json({ success: true, message: "Member added successfully", project });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const removeMember = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            res.json({ success: false, message: "Project not found" });
            return;
        }

        project.members = project.members.filter(
            (m) => m.userId.toString() !== req.params.userId
        );
        await project.save();

        res.json({ success: true, message: "Member removed successfully", project });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
