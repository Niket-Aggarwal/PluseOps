const jwt = require("jsonwebtoken")

const tokencheck = (authHeader) => {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return {
            success: false,
            message: "Token Missing"
        }
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { success: true, decoded }
}

const tokenerr = (part, err) => {
    if (err.name === "TokenExpiredError") {
        return {
            success: false,
            status: 400
        }
    }
    if (err.name === "JsonWebTokenError") {
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