const express = require("express");
const router = express.Router();
const authMiddleware = require("../Middleware/authMiddleware");
const { createProject, getUserProjects, getProjectById, updateProject, toggleProjectStatus, deleteProject, getLatestStatus, getProjectHistory, getDashboardStats, getHistoryDetail } = require("../Controllers/projectController");

router.use(authMiddleware);

router.post("/", createProject);
router.get("/", getUserProjects);
router.get("/stats", getDashboardStats);
router.get("/dashboard", getDashboardStats);
router.get("/:id", getProjectById);
router.put("/:id", updateProject);
router.patch("/:id/toggle", toggleProjectStatus);
router.delete("/:id", deleteProject);
router.get("/:id/latest", getLatestStatus);
router.get("/:id/history", getProjectHistory);
router.get("/:id/history/:historyId", getHistoryDetail);

module.exports = router;