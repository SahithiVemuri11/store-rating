"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
const authorize = (...roles) => (req, res, next) => {
    if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated.' });
        return;
    }
    if (!roles.includes(req.user.role)) {
        res.status(403).json({ success: false, message: 'Access forbidden: insufficient permissions.' });
        return;
    }
    next();
};
exports.authorize = authorize;
