const { tokencheck, tokenerr } = require("../utility/TokenCheck");

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const result = tokencheck(authHeader);
    if (!result.success) {
        if (result.err) {
            const errRes = tokenerr("Auth Middleware Error:", result.err);
            return res.status(errRes.status || 401).send(errRes);
        }
        return res.status(401).json({
            success: false,
            message: result.message || "Unauthorized access"
        });
    }
    req.user = { id: result.decoded.id };
    next();
};

module.exports = authMiddleware;