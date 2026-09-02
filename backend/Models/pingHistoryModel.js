const mongoose = require("mongoose");

const pingHistorySchema = new mongoose.Schema(
    {
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true,
            index: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Auth",
            index: true
        },
        checkedAt: {
            type: Date,
            required: true,
            default: Date.now
        },
        status: {
            type: String,
            enum: ["UP", "DOWN"],
            required: true
        },
        httpStatus: {
            type: Number,
            default: null
        },
        responseTimeMs: {
            type: Number,
            default: null
        },
        message: {
            type: String,
            default: ""
        },
        errorType: {
            type: String,
            default: null
        },
        responseReceived: {
            type: Boolean,
            default: false
        },
        timeout: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

pingHistorySchema.index({ projectId: 1, checkedAt: -1 });

module.exports = mongoose.model("PingHistory", pingHistorySchema);