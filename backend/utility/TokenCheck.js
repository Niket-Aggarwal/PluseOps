const jwt = require("jsonwebtoken")

const tokencheck = (authHeader) => {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return {
            success: false,
            message: "Token Missing"
        }
    }
    try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return { success: true, decoded };
    } catch (err) {
        return { success: false, err };
    }
}

const tokenerr = (part, err) => {
    if (err && err.name === "TokenExpiredError") {
        return {
            success: false,
            message: "Token Expired",
            status: 401
        }
    }
    if (err && err.name === "JsonWebTokenError") {
        return {
            success: false,
            message: "Invalid Token",
            status: 401
        }
    }
    console.error(part, err)
    return {
        success: false,
        message: "Something went wrong.",
        status: 500
    }
}

module.exports = { tokencheck, tokenerr };