const mongoose = require("mongoose");

const authSchema = new mongoose.Schema(
    {
        googleId: { type: String, default: null },
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        picture: { type: String, default: null }
    },
    { timestamps: true }
);

module.exports = mongoose.models.Auth || mongoose.model("Auth", authSchema);
