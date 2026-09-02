const { OAuth2Client } = require("google-auth-library")
const auth = require("../Models/authModel")
const jwt = require("jsonwebtoken")
const { tokencheck, tokenerr } = require("../utility/TokenCheck")

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

exports.Base = async (req, res) => {
    res.status(200).send({
        Title: "PluseOps",
        Tagline: "Api Awake",
        message: "This is Auth Base Url"
    });
}

exports.GoogleLogin = async (req, res) => {
    try {
        const { credential } = req.body;
        if (!credential) {
            return res.status(400).send({
                success: false,
                problem: "Google token credential missing"
            });
        }
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        
        let user = await auth.findOne({
            $or: [{ googleId: payload.sub }, { email: payload.email }]
        });

        if (!user) {
            user = await auth.create({
                googleId: payload.sub,
                name: payload.name,
                email: payload.email,
                picture: payload.picture
            });
        } else {
            let updated = false;
            if (!user.googleId) {
                user.googleId = payload.sub;
                updated = true;
            }
            if (payload.picture && user.picture !== payload.picture) {
                user.picture = payload.picture;
                updated = true;
            }
            if (payload.name && user.name !== payload.name) {
                user.name = payload.name;
                updated = true;
            }
            if (updated) {
                await user.save();
            }
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.status(200).send({
            success: true,
            token,
            user: { name: user.name, email: user.email, picture: user.picture }
        });
    }
    catch (err) {
        console.error("Login Error:", err);
        res.status(400).send({
            success: false,
            problem: err.message || "Login Failed!! Try Again"
        });
    }
};

exports.ActiveSession = async (req, res) => {
    try {
        const result = tokencheck(req.headers.authorization);
        if (!result.success) {
            if (result.err) {
                const errRes = tokenerr("ActiveSession JWT error:", result.err);
                return res.status(errRes.status).send(errRes);
            }
            return res.status(401).send(result);
        }
        const exist = await auth.findById(result.decoded.id)
        if (!exist) {
            return res.status(401).send({
                success: false,
                message: "User Not found"
            });
        }
        return res.status(200).send({
            success: true,
            user: {
                name: exist.name,
                email: exist.email,
                picture: exist.picture
            }
        });
    } catch (err) {
        const result = tokenerr("Activesession Error:", err)
        return res.status(result.status).send({
            success: result.success,
            message: result.message
        })
    }
};