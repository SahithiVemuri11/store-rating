"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyStoreRatings = exports.getMyStore = void 0;
const db_1 = require("../config/db");
/** GET /api/owner/store — Get the owner's store with aggregated stats */
const getMyStore = async (req, res) => {
    try {
        const ownerId = req.user.id;
        const store = await db_1.prisma.store.findUnique({
            where: { ownerId },
            include: { ratings: { select: { ratingValue: true } } },
        });
        if (!store) {
            res.status(404).json({ success: false, message: 'No store is assigned to your account.' });
            return;
        }
        const { ratings, ...rest } = store;
        const totalRatings = ratings.length;
        const averageRating = totalRatings > 0
            ? parseFloat((ratings.reduce((sum, r) => sum + r.ratingValue, 0) / totalRatings).toFixed(2))
            : null;
        res.json({ success: true, store: { ...rest, totalRatings, averageRating } });
    }
    catch {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};
exports.getMyStore = getMyStore;
/** GET /api/owner/ratings — Get all customer ratings for the owner's store */
const getMyStoreRatings = async (req, res) => {
    try {
        const ownerId = req.user.id;
        const store = await db_1.prisma.store.findUnique({ where: { ownerId } });
        if (!store) {
            res.status(404).json({ success: false, message: 'No store is assigned to your account.' });
            return;
        }
        const { sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        const allowedFields = ['createdAt', 'ratingValue'];
        const field = allowedFields.includes(sortBy) ? sortBy : 'createdAt';
        const order = sortOrder === 'asc' ? 'asc' : 'desc';
        const ratings = await db_1.prisma.rating.findMany({
            where: { storeId: store.id },
            include: {
                user: { select: { id: true, name: true, email: true } },
            },
            orderBy: { [field]: order },
        });
        res.json({ success: true, storeId: store.id, storeName: store.name, ratings });
    }
    catch {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};
exports.getMyStoreRatings = getMyStoreRatings;
