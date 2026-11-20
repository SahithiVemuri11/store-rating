import { Request, Response } from 'express';
import { prisma } from '../config/db';

/** GET /api/user/stores — Browse stores with search, sort, and user's own rating */
export const getStores = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search = '', sortBy = 'name', sortOrder = 'asc' } = req.query as Record<string, string>;
    const userId = req.user!.id;

    const stores = await prisma.store.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search } },
              { address: { contains: search } },
            ],
          }
        : {},
      include: {
        ratings: { select: { ratingValue: true, userId: true } },
      },
    });

    // Compute average rating and user's own rating for each store
    let result = stores.map((store) => {
      const { ratings, ...rest } = store;
      const totalRatings = ratings.length;
      const averageRating =
        totalRatings > 0
          ? parseFloat((ratings.reduce((sum, r) => sum + r.ratingValue, 0) / totalRatings).toFixed(2))
          : null;
      const myRating = ratings.find((r) => r.userId === userId)?.ratingValue ?? null;
      return { ...rest, totalRatings, averageRating, myRating };
    });

    // Apply sorting
    const order = sortOrder === 'desc' ? -1 : 1;
    if (sortBy === 'averageRating') {
      result.sort((a, b) => {
        const aVal = a.averageRating ?? -1;
        const bVal = b.averageRating ?? -1;
        return (aVal - bVal) * order;
      });
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name) * order);
    } else if (sortBy === 'address') {
      result.sort((a, b) => a.address.localeCompare(b.address) * order);
    }

    res.json({ success: true, stores: result });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error fetching stores.' });
  }
};

/** POST /api/user/ratings — Submit or update a rating (upsert) */
export const submitRating = async (req: Request, res: Response): Promise<void> => {
  try {
    const { storeId, ratingValue } = req.body;
    const userId = req.user!.id;

    // Verify the store exists
    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) {
      res.status(404).json({ success: false, message: 'Store not found.' });
      return;
    }

    // Upsert: create or update based on unique(userId, storeId)
    const rating = await prisma.rating.upsert({
      where: { unique_user_store_rating: { userId, storeId } },
      update: { ratingValue },
      create: { userId, storeId, ratingValue },
    });

    res.json({ success: true, message: 'Rating submitted successfully.', rating });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error submitting rating.' });
  }
};
