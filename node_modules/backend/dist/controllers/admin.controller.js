"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStore = exports.getStores = exports.createUser = exports.getUsers = exports.getDashboard = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("../config/db");
/** GET /api/admin/dashboard */
const getDashboard = async (_req, res) => {
    try {
        const [totalUsers, totalStores, totalRatings] = await Promise.all([
            db_1.prisma.user.count(),
            db_1.prisma.store.count(),
            db_1.prisma.rating.count(),
        ]);
        res.json({ success: true, stats: { totalUsers, totalStores, totalRatings } });
    }
    catch {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};
exports.getDashboard = getDashboard;
/** GET /api/admin/users */
const getUsers = async (req, res) => {
    try {
        const { search = '', role, sortBy = 'name', sortOrder = 'asc' } = req.query;
        const allowedSortFields = ['name', 'email', 'address', 'role', 'createdAt'];
        const field = allowedSortFields.includes(sortBy) ? sortBy : 'name';
        const order = sortOrder === 'desc' ? 'desc' : 'asc';
        const users = await db_1.prisma.user.findMany({
            where: {
                AND: [
                    search
                        ? {
                            OR: [
                                { name: { contains: search } },
                                { email: { contains: search } },
                                { address: { contains: search } },
                            ],
                        }
                        : {},
                    role ? { role: role } : {},
                ],
            },
            select: {
                id: true,
                name: true,
                email: true,
                address: true,
                role: true,
                createdAt: true,
                ownedStore: { select: { id: true, name: true } },
            },
            orderBy: { [field]: order },
        });
        res.json({ success: true, users });
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Server error fetching users.' });
    }
};
exports.getUsers = getUsers;
/** POST /api/admin/users */
const createUser = async (req, res) => {
    try {
        const { name, email, password, address, role } = req.body;
        const existing = await db_1.prisma.user.findUnique({ where: { email } });
        if (existing) {
            res.status(409).json({ success: false, message: 'Email is already registered.' });
            return;
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const user = await db_1.prisma.user.create({
            data: { name, email, passwordHash, address, role },
            select: { id: true, name: true, email: true, address: true, role: true, createdAt: true },
        });
        res.status(201).json({ success: true, message: 'User created successfully.', user });
    }
    catch {
        res.status(500).json({ success: false, message: 'Server error creating user.' });
    }
};
exports.createUser = createUser;
/** GET /api/admin/stores */
const getStores = async (req, res) => {
    try {
        const { search = '', sortBy = 'name', sortOrder = 'asc' } = req.query;
        const allowedSortFields = ['name', 'email', 'address', 'createdAt'];
        const field = allowedSortFields.includes(sortBy) ? sortBy : 'name';
        const order = sortOrder === 'desc' ? 'desc' : 'asc';
        const stores = await db_1.prisma.store.findMany({
            where: search
                ? {
                    OR: [
                        { name: { contains: search } },
                        { email: { contains: search } },
                        { address: { contains: search } },
                    ],
                }
                : {},
            include: {
                owner: { select: { id: true, name: true, email: true } },
                ratings: { select: { ratingValue: true } },
            },
            orderBy: { [field]: order },
        });
        const result = stores.map((store) => {
            const { ratings, ...rest } = store;
            const totalRatings = ratings.length;
            const averageRating = totalRatings > 0
                ? parseFloat((ratings.reduce((sum, r) => sum + r.ratingValue, 0) / totalRatings).toFixed(2))
                : null;
            return { ...rest, totalRatings, averageRating };
        });
        res.json({ success: true, stores: result });
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Server error fetching stores.' });
    }
};
exports.getStores = getStores;
/** POST /api/admin/stores */
const createStore = async (req, res) => {
    try {
        const { name, email, address, ownerId } = req.body;
        const existingEmail = await db_1.prisma.store.findUnique({ where: { email } });
        if (existingEmail) {
            res.status(409).json({ success: false, message: 'Store email is already in use.' });
            return;
        }
        if (ownerId) {
            const ownerUser = await db_1.prisma.user.findUnique({ where: { id: ownerId } });
            if (!ownerUser || ownerUser.role !== 'STORE_OWNER') {
                res.status(400).json({ success: false, message: 'ownerId must reference an existing STORE_OWNER user.' });
                return;
            }
            const alreadyOwns = await db_1.prisma.store.findUnique({ where: { ownerId } });
            if (alreadyOwns) {
                res.status(409).json({ success: false, message: 'This store owner already manages another store.' });
                return;
            }
        }
        const store = await db_1.prisma.store.create({
            data: { name, email, address, ownerId: ownerId || null },
            include: { owner: { select: { id: true, name: true, email: true } } },
        });
        res.status(201).json({ success: true, message: 'Store created successfully.', store });
    }
    catch {
        res.status(500).json({ success: false, message: 'Server error creating store.' });
    }
};
exports.createStore = createStore;
