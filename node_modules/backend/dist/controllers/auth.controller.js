"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.getMe = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../config/db");
/** POST /api/auth/register — Normal user self-registration */
const register = async (req, res) => {
    try {
        const { name, email, password, address } = req.body;
        const existing = await db_1.prisma.user.findUnique({ where: { email } });
        if (existing) {
            res.status(409).json({ success: false, message: 'Email is already registered.' });
            return;
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const user = await db_1.prisma.user.create({
            data: { name, email, passwordHash, address, role: 'NORMAL_USER' },
            select: { id: true, name: true, email: true, address: true, role: true, createdAt: true },
        });
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') });
        res.status(201).json({ success: true, message: 'Registration successful.', token, user });
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Server error during registration.' });
    }
};
exports.register = register;
/** POST /api/auth/login */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await db_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(401).json({ success: false, message: 'Invalid email or password.' });
            return;
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isMatch) {
            res.status(401).json({ success: false, message: 'Invalid email or password.' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') });
        res.json({
            success: true,
            message: 'Login successful.',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                address: user.address,
                role: user.role,
            },
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Server error during login.' });
    }
};
exports.login = login;
/** GET /api/auth/me — Fetch current user info */
const getMe = async (req, res) => {
    try {
        const user = await db_1.prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, name: true, email: true, address: true, role: true, createdAt: true },
        });
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found.' });
            return;
        }
        res.json({ success: true, user });
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};
exports.getMe = getMe;
/** PUT /api/auth/change-password */
const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const user = await db_1.prisma.user.findUnique({ where: { id: req.user.id } });
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found.' });
            return;
        }
        const isMatch = await bcryptjs_1.default.compare(oldPassword, user.passwordHash);
        if (!isMatch) {
            res.status(400).json({ success: false, message: 'Old password is incorrect.' });
            return;
        }
        const passwordHash = await bcryptjs_1.default.hash(newPassword, 10);
        await db_1.prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
        res.json({ success: true, message: 'Password changed successfully.' });
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};
exports.changePassword = changePassword;
