const nodemailer = require("nodemailer");

function createTransporter() {
    const host = process.env.EMAIL_HOST;
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASSWORD;
    const port = parseInt(process.env.EMAIL_PORT, 10) || 587;
    if (!host || !user || !pass) {
        return null;
    }
    return nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
            user,
            pass
        }
    });
}

async function sendFailureAlert(userEmail, project, httpStatus, errorMessage) {
    if (!userEmail) {
        console.log(`[WORKER ALERT] No email recipient found for project: ${project.name}`);
        return;
    }
    const transporter = createTransporter();
    if (!transporter) {
        console.log(`[WORKER ALERT] Email service not configured. Skipping failure alert email to ${userEmail} for project: ${project.name}`);
        return;
    }
    const from = process.env.EMAIL_FROM || process.env.EMAIL_USER || "alerts@pulseops.com";
    const subject = `PulseOps Alert: ${project.name} is Down`;
    const textContent = `
PulseOps Monitoring Alert

Project Name: ${project.name}
Status: DOWN
Consecutive Failures: ${project.consecutiveFailures}
HTTP Status: ${httpStatus || "N/A"}
Error Message: ${errorMessage || "No response received"}
Detected At: ${new Date().toISOString()}

Please check your application logs and server health.
`;
    try {
        await transporter.sendMail({
            from,
            to: userEmail,
            subject,
            text: textContent
        });
        console.log(`[WORKER ALERT] Failure alert email sent successfully to ${userEmail} for project: ${project.name}`);
    } catch (err) {
        console.error(`[WORKER ALERT] Failed to send alert email to ${userEmail}:`, err.message);
    }
}

async function sendRecoveryAlert(userEmail, project) {
    if (!userEmail) return;
    const transporter = createTransporter();
    if (!transporter) {
        console.log(`[WORKER ALERT] Email service not configured. Skipping recovery email to ${userEmail} for project: ${project.name}`);
        return;
    }
    const from = process.env.EMAIL_FROM || process.env.EMAIL_USER || "alerts@pulseops.com";
    const subject = `PulseOps Resolved: ${project.name} is back UP`;
    const textContent = `
PulseOps Monitoring Recovery

Project Name: ${project.name}
Status: UP
Recovered At: ${new Date().toISOString()}

Your application is responding normally.
`;
    try {
        await transporter.sendMail({
            from,
            to: userEmail,
            subject,
            text: textContent
        });
        console.log(`[WORKER ALERT] Recovery email sent successfully to ${userEmail} for project: ${project.name}`);
    } catch (err) {
        console.error(`[WORKER ALERT] Failed to send recovery email to ${userEmail}:`, err.message);
    }
}

module.exports = { sendFailureAlert, sendRecoveryAlert };