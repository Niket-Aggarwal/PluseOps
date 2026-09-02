const mongoose = require("mongoose");

async function connectWorkerDB() {
    try {
        const mongoUrl = process.env.MONGO_DB_URL || process.env.MONGO_URI;
        if (!mongoUrl) {
            throw new Error("MONGO_DB_URL environment variable is not defined");
        }
        await mongoose.connect(mongoUrl);
        console.log("[WORKER DB] Connected to MongoDB successfully.");
    } catch (err) {
        console.error("[WORKER DB] Connection failed:", err.message);
        process.exit(1);
    }
}

module.exports = connectWorkerDB;