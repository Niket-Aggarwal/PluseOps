const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Auth",
            required: true,
            index: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        baseUrl: {
            type: String,
            required: true,
            trim: true
        },
        intervalMinutes: {
            type: Number,
            required: true,
            min: 1
        },
        description: {
            type: String,
            default: ""
        },
        isActive: {
            type: Boolean,
            default: true
        },
        lastCheckedAt: {
            type: Date,
            default: null
        },
        nextCheckAt: {
            type: Date,
            default: null
        },
        currentStatus: {
            type: String,
            enum: ["UP", "DOWN", "UNKNOWN"],
            default: "UNKNOWN"
        },
        lastResponseTime: {
            type: Number,
            default: null
        },
        lastHttpStatus: {
            type: Number,
            default: null
        },
        lastMessage: {
            type: String,
            default: null
        },
        consecutiveFailures: {
            type: Number,
            default: 0
        },
        totalChecks: {
            type: Number,
            default: 0
        },
        totalFailures: {
            type: Number,
            default: 0
        },
        alertSent: {
            type: Boolean,
            default: false
        },
        publicStatusEnabled: {
            type: Boolean,
            default: true
        },
        publicStatusId: {
            type: String,
            required: true
        }
    },
    { timestamps: true }
);

projectSchema.index({ isActive: 1, nextCheckAt: 1 });
module.exports = mongoose.models.Project || mongoose.model("Project", projectSchema);