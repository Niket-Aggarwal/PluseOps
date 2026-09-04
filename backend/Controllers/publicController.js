const Project = require("../Models/projectModel");

exports.getPublicStatus = async (req, res) => {
    try {
        const { publicStatusId } = req.params;
        if (!publicStatusId || typeof publicStatusId !== "string") {
            return res.status(400).send({ success: false, message: "Public status ID is required" });
        }
        const project = await Project.findOne({ publicStatusId: publicStatusId.trim(), publicStatusEnabled: true });
        if (!project) {
            return res.status(404).send({ success: false, message: "Public status page not found or disabled" });
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
                lastResponseTime: project.lastResponseTime,
                lastHttpStatus: project.lastHttpStatus,
                lastMessage: project.lastMessage,
                totalChecks: project.totalChecks,
                totalFailures: project.totalFailures,
                uptimePercentage
            }
        });
    } catch (err) {
        console.error("Get Public Status Error:", err);
        return res.status(500).send({ success: false, message: "Internal server error" });
    }
};