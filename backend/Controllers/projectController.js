const crypto = require("crypto");
const mongoose = require("mongoose");
const Project = require("../Models/projectModel");
const PingHistory = require("../Models/pingHistoryModel");
const { validateAndCheckSSRF } = require("../utility/ssrfCheck");
const { tokencheck, tokenerr } = require("../utility/TokenCheck");

const getAuthenticatedUserId = (req, res) => {
    const authHeader = req.headers.authorization;
    const result = tokencheck(authHeader);
    if (!result.success) {
        if (result.err) {
            const errRes = tokenerr("Controller Auth Error:", result.err);
            res.status(errRes.status || 401).send(errRes);
            return null;
        }
        res.status(401).send(result);
        return null;
    }
    return result.decoded.id;
};

exports.createProject = async (req, res) => {
    try {
        const userId = getAuthenticatedUserId(req, res);
        if (!userId) return;
        const { name, baseUrl, intervalMinutes, description, publicStatusEnabled } = req.body;
        if (!name || typeof name !== "string" || !name.trim()) {
            return res.status(400).json({ success: false, message: "Project name is required" });
        }
        if (name.trim().length > 100) {
            return res.status(400).json({ success: false, message: "Project name exceeds maximum length of 100 characters" });
        }
        const ssrfResult = validateAndCheckSSRF(baseUrl);
        if (!ssrfResult.valid) {
            return res.status(400).json({ success: false, message: ssrfResult.reason });
        }
        const parsedInterval = parseInt(intervalMinutes, 10);
        if (isNaN(parsedInterval) || parsedInterval < 1) {
            return res.status(400).json({ success: false, message: "Interval must be a positive number of at least 1 minute" });
        }
        const publicStatusId = crypto.randomBytes(12).toString("hex");
        const project = await Project.create({
            userId,
            name: name.trim(),
            baseUrl: baseUrl.trim(),
            intervalMinutes: parsedInterval,
            description: description ? description.trim() : "",
            publicStatusEnabled: publicStatusEnabled !== undefined ? Boolean(publicStatusEnabled) : true,
            publicStatusId,
            currentStatus: "UNKNOWN",
            nextCheckAt: new Date()
        });
        return res.status(201).send({
            success: true,
            message: "Project created successfully",
            data: project
        });
    } catch (err) {
        console.error("Create Project Error:", err);
        return res.status(500).send({ success: false, message: "Internal server error" });
    }
};

exports.getUserProjects = async (req, res) => {
    try {
        const userId = getAuthenticatedUserId(req, res);
        if (!userId) return;
        const projects = await Project.find({ userId }).sort({ createdAt: -1 });
        return res.status(200).send({
            success: true,
            data: projects
        });
    } catch (err) {
        console.error("Get User Projects Error:", err);
        return res.status(500).send({ success: false, message: "Internal server error" });
    }
};

exports.getProjectById = async (req, res) => {
    try {
        const userId = getAuthenticatedUserId(req, res);
        if (!userId) return;
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send({ success: false, message: "Invalid project ID format" });
        }
        const project = await Project.findOne({ _id: id, userId });
        if (!project) {
            return res.status(404).send({ success: false, message: "Project not found or access denied" });
        }
        return res.status(200).send({
            success: true,
            data: project
        });
    } catch (err) {
        console.error("Get Project By ID Error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.updateProject = async (req, res) => {
    try {
        const userId = getAuthenticatedUserId(req, res);
        if (!userId) return;
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send({ success: false, message: "Invalid project ID format" });
        }
        const project = await Project.findOne({ _id: id, userId });
        if (!project) {
            return res.status(404).send({ success: false, message: "Project not found or access denied" });
        }
        const { name, baseUrl, intervalMinutes, description, isActive, publicStatusEnabled } = req.body;
        if (name !== undefined) {
            if (!name || typeof name !== "string" || !name.trim()) {
                return res.status(400).send({ success: false, message: "Project name cannot be empty" });
            }
            if (name.trim().length > 100) {
                return res.status(400).send({ success: false, message: "Project name exceeds maximum length of 100 characters" });
            }
            project.name = name.trim();
        }
        if (baseUrl !== undefined) {
            const ssrfResult = validateAndCheckSSRF(baseUrl);
            if (!ssrfResult.valid) {
                return res.status(400).send({ success: false, message: ssrfResult.reason });
            }
            project.baseUrl = baseUrl.trim();
        }
        if (intervalMinutes !== undefined) {
            const parsedInterval = parseInt(intervalMinutes, 10);
            if (isNaN(parsedInterval) || parsedInterval < 1) {
                return res.status(400).send({ success: false, message: "Interval must be a positive number of at least 1 minute" });
            }
            project.intervalMinutes = parsedInterval;
        }
        if (description !== undefined) {
            project.description = typeof description === "string" ? description.trim() : "";
        }
        if (isActive !== undefined) {
            const newActive = Boolean(isActive);
            if (newActive && !project.isActive) {
                project.nextCheckAt = new Date();
            }
            project.isActive = newActive;
        }
        if (publicStatusEnabled !== undefined) {
            project.publicStatusEnabled = Boolean(publicStatusEnabled);
        }
        await project.save();
        return res.status(200).send({
            success: true,
            message: "Project updated successfully",
            data: project
        });
    } catch (err) {
        console.error("Update Project Error:", err);
        return res.status(500).send({ success: false, message: "Internal server error" });
    }
};

exports.toggleProjectStatus = async (req, res) => {
    try {
        const userId = getAuthenticatedUserId(req, res);
        if (!userId) return;
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send({ success: false, message: "Invalid project ID format" });
        }
        const project = await Project.findOne({ _id: id, userId });
        if (!project) {
            return res.status(404).send({ success: false, message: "Project not found or access denied" });
        }
        project.isActive = !project.isActive;
        if (project.isActive) {
            project.nextCheckAt = new Date();
        }
        await project.save();
        return res.status(200).send({
            success: true,
            message: `Project ${project.isActive ? "activated" : "deactivated"} successfully`,
            data: project
        });
    } catch (err) {
        console.error("Toggle Project Error:", err);
        return res.status(500).send({ success: false, message: "Internal server error" });
    }
};

exports.deleteProject = async (req, res) => {
    try {
        const userId = getAuthenticatedUserId(req, res);
        if (!userId) return;
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send({ success: false, message: "Invalid project ID format" });
        }
        const project = await Project.findOne({ _id: id, userId });
        if (!project) {
            return res.status(404).send({ success: false, message: "Project not found or access denied" });
        }
        await Project.deleteOne({ _id: id });
        await PingHistory.deleteMany({ projectId: id });
        return res.status(200).send({
            success: true,
            message: "Project deleted successfully"
        });
    } catch (err) {
        console.error("Delete Project Error:", err);
        return res.status(500).send({ success: false, message: "Internal server error" });
    }
};

exports.getLatestStatus = async (req, res) => {
    try {
        const userId = getAuthenticatedUserId(req, res);
        if (!userId) return;
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send({ success: false, message: "Invalid project ID format" });
        }
        const project = await Project.findOne({ _id: id, userId });
        if (!project) {
            return res.status(404).send({ success: false, message: "Project not found or access denied" });
        }
        const uptimePercentage = project.totalChecks > 0
            ? Number(((project.totalChecks - project.totalFailures) / project.totalChecks * 100).toFixed(2))
            : 100;
        return res.status(200).send({
            success: true,
            data: {
                name: project.name,
                currentStatus: project.currentStatus,
                lastCheckedAt: project.lastCheckedAt,
                nextCheckAt: project.nextCheckAt,
                lastResponseTime: project.lastResponseTime,
                lastHttpStatus: project.lastHttpStatus,
                lastMessage: project.lastMessage,
                consecutiveFailures: project.consecutiveFailures,
                totalChecks: project.totalChecks,
                totalFailures: project.totalFailures,
                uptimePercentage,
                publicStatusId: project.publicStatusId,
                publicStatusEnabled: project.publicStatusEnabled
            }
        });
    } catch (err) {
        console.error("Get Latest Status Error:", err);
        return res.status(500).send({ success: false, message: "Internal server error" });
    }
};

exports.getProjectHistory = async (req, res) => {
    try {
        const userId = getAuthenticatedUserId(req, res);
        if (!userId) return;
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send({ success: false, message: "Invalid project ID format" });
        }
        const project = await Project.findOne({ _id: id, userId });
        if (!project) {
            return res.status(404).send({ success: false, message: "Project not found or access denied" });
        }
        let limit = parseInt(req.query.limit, 10) || 50;
        let page = parseInt(req.query.page, 10) || 1;
        if (limit < 1) limit = 50;
        if (limit > 100) limit = 100;
        if (page < 1) page = 1;
        const skip = (page - 1) * limit;
        const history = await PingHistory.find({ projectId: id }).sort({ checkedAt: -1 }).skip(skip).limit(limit);
        const total = await PingHistory.countDocuments({ projectId: id });
        return res.status(200).send({
            success: true,
            data: {
                history,
                total,
                page,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        console.error("Get Project History Error:", err);
        return res.status(500).send({ success: false, message: "Internal server error" });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        const userId = getAuthenticatedUserId(req, res);
        if (!userId) return;
        const projects = await Project.find({ userId });
        const totalProjects = projects.length;
        const activeProjects = projects.filter(p => p.isActive).length;
        const currentlyUP = projects.filter(p => p.currentStatus === "UP").length;
        const currentlyDOWN = projects.filter(p => p.currentStatus === "DOWN").length;
        const currentlyUNKNOWN = projects.filter(p => p.currentStatus === "UNKNOWN").length;
        let totalChecks = 0;
        let totalFailures = 0;
        let latestCheckTime = null;
        let latestResponseTime = null;
        for (const p of projects) {
            totalChecks += p.totalChecks || 0;
            totalFailures += p.totalFailures || 0;
            if (p.lastCheckedAt) {
                const checkTime = new Date(p.lastCheckedAt);
                if (!latestCheckTime || checkTime > new Date(latestCheckTime)) {
                    latestCheckTime = p.lastCheckedAt;
                    latestResponseTime = p.lastResponseTime;
                }
            }
        }
        return res.status(200).json({
            success: true,
            data: {
                totalProjects,
                activeProjects,
                currentlyUP,
                currentlyDOWN,
                currentlyUNKNOWN,
                totalChecks,
                totalFailures,
                latestResponseTime,
                latestCheckTime
            }
        });
    } catch (err) {
        console.error("Get Dashboard Stats Error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.getHistoryDetail = async (req, res) => {
    try {
        const userId = getAuthenticatedUserId(req, res);
        if (!userId) return;

        const { id, historyId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(historyId)) {
            return res.status(400).json({ success: false, message: "Invalid project ID or history ID format" });
        }
        const project = await Project.findOne({ _id: id, userId });
        if (!project) {
            return res.status(404).json({ success: false, message: "Project not found or access denied" });
        }
        const historyRecord = await PingHistory.findOne({ _id: historyId, projectId: id, userId });
        if (!historyRecord) {
            return res.status(404).json({ success: false, message: "History record not found" });
        }
        return res.status(200).json({
            success: true,
            data: historyRecord
        });
    } catch (err) {
        console.error("Get History Detail Error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};