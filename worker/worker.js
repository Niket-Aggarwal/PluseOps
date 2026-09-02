require("dotenv").config();
const cron = require("node-cron");
const connectWorkerDB = require("./Config/db");
const { processDueProjects } = require("./services/monitoringService");

async function startWorker() {
    console.log("==================================================");
    console.log("       PulseOps Monitoring Worker Starting...      ");
    console.log("==================================================");
    await connectWorkerDB();
    console.log("[WORKER] Running initial monitoring check on startup...");
    await processDueProjects();
    cron.schedule("* * * * *", async () => {
        await processDueProjects();
    });
    console.log("[WORKER] Scheduler active: Running every 1 minute (* * * * *).");
}

startWorker();