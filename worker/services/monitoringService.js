const Project = require("../Models/projectModel");
const PingHistory = require("../Models/pingHistoryModel");
const Auth = require("../Models/authModel");
const { sendFailureAlert, sendRecoveryAlert } = require("./emailService");
const { validateAndCheckSSRF } = require("../utility/ssrfCheck");

const processingProjectIds = new Set();

async function processDueProjects() {
    const cycleTime = new Date();
    console.log(`[WORKER] Monitoring cycle started at ${cycleTime.toISOString()}`);
    try {
        const dueProjects = await Project.find({
            isActive: true,
            $or: [
                { nextCheckAt: null },
                { nextCheckAt: { $lte: cycleTime } }
            ]
        });
        console.log(`[WORKER] Found ${dueProjects.length} due projects to monitor`);
        for (const project of dueProjects) {
            const projectIdStr = project._id.toString();
            if (processingProjectIds.has(projectIdStr)) {
                console.log(`[WORKER] Project ${project.name} (${projectIdStr}) is already being processed. Skipping.`);
                continue;
            }
            processingProjectIds.add(projectIdStr);
            try {
                await checkSingleProject(project, cycleTime);
            } catch (err) {
                console.error(`[WORKER ERROR] Unexpected error checking project ${project.name}:`, err.message);
            } finally {
                processingProjectIds.delete(projectIdStr);
            }
        }
    } catch (err) {
        console.error("[WORKER ERROR] Error fetching due projects from MongoDB:", err.message);
    } finally {
        console.log(`[WORKER] Monitoring cycle completed at ${new Date().toISOString()}`);
    }
}

async function checkSingleProject(project, checkTime) {
    const startTime = Date.now();
    let status = "DOWN";
    let httpStatus = null;
    let responseTimeMs = null;
    let message = "";
    let errorType = null;
    let responseReceived = false;
    let isTimeout = false;
    const ssrfCheck = validateAndCheckSSRF(project.baseUrl);
    if (!ssrfCheck.valid) {
        status = "DOWN";
        message = `Monitoring blocked: ${ssrfCheck.reason}`;
        errorType = "SSRF_BLOCKED";
    } else {
        try {
            const response = await fetch(project.baseUrl, {
                method: "GET",
                headers: {
                    "User-Agent": "PulseOps-Monitor/1.0 (API Health Checker)"
                },
                signal: AbortSignal.timeout(10000)
            });
            responseTimeMs = Date.now() - startTime;
            httpStatus = response.status;
            responseReceived = true;
            if (response.ok) {
                status = "UP";
                message = `API responded successfully with HTTP ${response.status}`;
            } else {
                status = "DOWN";
                message = `HTTP Error ${response.status}: ${response.statusText || "Unsuccessful status code"}`;
                errorType = "HTTP_ERROR";
            }
        } catch (fetchErr) {
            responseTimeMs = Date.now() - startTime;
            responseReceived = false;
            if (fetchErr.name === "AbortError" || fetchErr.name === "TimeoutError") {
                isTimeout = true;
                message = "Request timed out after 10000ms";
                errorType = "TIMEOUT";
            } else {
                message = fetchErr.message || "Network connection failed";
                errorType = fetchErr.code || "NETWORK_ERROR";
            }
        }
    }
    console.log(`[WORKER] ${project.name} -> ${status} | Status: ${httpStatus || "N/A"} | Time: ${responseTimeMs !== null ? responseTimeMs + "ms" : "N/A"}`);
    if (project.consecutiveFailures === undefined || project.consecutiveFailures === null) {
        project.consecutiveFailures = 0;
    }
    if (project.totalFailures === undefined || project.totalFailures === null) {
        project.totalFailures = 0;
    }
    if (project.totalChecks === undefined || project.totalChecks === null) {
        project.totalChecks = 0;
    }
    if (status === "UP") {
        const wasAlertSent = Boolean(project.alertSent);
        project.consecutiveFailures = 0;
        project.alertSent = false;
        if (wasAlertSent) {
            console.log(`[WORKER] ${project.name} recovered from previous failure. Sending recovery alert.`);
            const user = await Auth.findById(project.userId);
            if (user && user.email) {
                await sendRecoveryAlert(user.email, project);
            }
        }
    } else {
        project.consecutiveFailures += 1;
        project.totalFailures += 1;
        console.log(`[WORKER] ${project.name} consecutive failures: ${project.consecutiveFailures}`);
        if (project.consecutiveFailures >= 3 && !project.alertSent) {
            console.log(`[WORKER] ${project.name} reached 3 consecutive failures. Triggering email alert!`);
            const user = await Auth.findById(project.userId);
            if (user && user.email) {
                await sendFailureAlert(user.email, project, httpStatus, message);
            }
            project.alertSent = true;
        }
    }
    project.totalChecks += 1;
    project.lastCheckedAt = checkTime;
    project.currentStatus = status;
    project.lastResponseTime = responseTimeMs;
    project.lastHttpStatus = httpStatus;
    project.lastMessage = message;
    const nextTime = new Date(checkTime.getTime() + project.intervalMinutes * 60 * 1000);
    project.nextCheckAt = nextTime;
    await project.save();
    await PingHistory.create({
        projectId: project._id,
        userId: project.userId,
        checkedAt: checkTime,
        status,
        httpStatus,
        responseTimeMs,
        message,
        errorType,
        responseReceived,
        timeout: isTimeout
    });
}

module.exports = { processDueProjects };