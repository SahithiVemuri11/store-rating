"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./config/db");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const owner_routes_1 = __importDefault(require("./routes/owner.routes"));
const error_middleware_1 = require("./middlewares/error.middleware");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// --- Middleware ---
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// --- Health check ---
app.get('/api/health', (_req, res) => {
    res.json({ success: true, message: 'Store Rating API is running.', timestamp: new Date().toISOString() });
});
// --- Routes ---
app.use('/api/auth', auth_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
app.use('/api/user', user_routes_1.default);
app.use('/api/owner', owner_routes_1.default);
// --- 404 handler ---
app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Route not found.' });
});
// --- Centralized error handler ---
app.use(error_middleware_1.errorHandler);
// --- Server startup ---
const startServer = async () => {
    await (0, db_1.connectDB)();
    const server = app.listen(PORT, () => {
        console.log(`🚀 Server running at http://localhost:${PORT}`);
        console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
    });
    // Graceful shutdown
    process.on('SIGINT', async () => {
        console.log('\nShutting down gracefully...');
        server.close();
        await (0, db_1.disconnectDB)();
        process.exit(0);
    });
};
startServer();
