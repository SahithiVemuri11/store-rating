import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/db';

/** GET /api/admin/dashboard */
export const getDashboard = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      prisma.user.count(),
      prisma.store.count(),
      prisma.rating.count(),
    ]);
    res.json({ success: true, stats: { totalUsers, totalStores, totalRatings } });
  } catch {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/** GET /api/admin/users */
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search = '', role, sortBy = 'name', sortOrder = 'asc' } = req.query as Record<string, string>;

    const allowedSortFields = ['name', 'email', 'address', 'role', 'createdAt'];
    const field = allowedSortFields.includes(sortBy) ? sortBy : 'name';
    const order = sortOrder === 'desc' ? 'desc' : 'asc';

    const users = await prisma.user.findMany({
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
          role ? { role: role as 'ADMIN' | 'NORMAL_USER' | 'STORE_OWNER' } : {},
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
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error fetching users.' });
  }
};

/** POST /api/admin/users */
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, address, role } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ success: false, message: 'Email is already registered.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, passwordHash, address, role },
      select: { id: true, name: true, email: true, address: true, role: true, createdAt: true },
    });

    res.status(201).json({ success: true, message: 'User created successfully.', user });
  } catch {
    res.status(500).json({ success: false, message: 'Server error creating user.' });
  }
};

/** GET /api/admin/stores */
export const getStores = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search = '', sortBy = 'name', sortOrder = 'asc' } = req.query as Record<string, string>;

    const allowedSortFields = ['name', 'email', 'address', 'createdAt'];
    const field = allowedSortFields.includes(sortBy) ? sortBy : 'name';
    const order = sortOrder === 'desc' ? 'desc' : 'asc';

    const stores = await prisma.store.findMany({
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
      const averageRating =
        totalRatings > 0
          ? parseFloat((ratings.reduce((sum, r) => sum + r.ratingValue, 0) / totalRatings).toFixed(2))
          : null;
      return { ...rest, totalRatings, averageRating };
    });

    res.json({ success: true, stores: result });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error fetching stores.' });
  }
};

/** POST /api/admin/stores */
export const createStore = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, address, ownerId } = req.body;

    const existingEmail = await prisma.store.findUnique({ where: { email } });
    if (existingEmail) {
      res.status(409).json({ success: false, message: 'Store email is already in use.' });
      return;
    }

    if (ownerId) {
      const ownerUser = await prisma.user.findUnique({ where: { id: ownerId } });
      if (!ownerUser || ownerUser.role !== 'STORE_OWNER') {
        res.status(400).json({ success: false, message: 'ownerId must reference an existing STORE_OWNER user.' });
        return;
      }
      const alreadyOwns = await prisma.store.findUnique({ where: { ownerId } });
      if (alreadyOwns) {
        res.status(409).json({ success: false, message: 'This store owner already manages another store.' });
        return;
      }
    }

    const store = await prisma.store.create({
      data: { name, email, address, ownerId: ownerId || null },
      include: { owner: { select: { id: true, name: true, email: true } } },
    });

    res.status(201).json({ success: true, message: 'Store created successfully.', store });
  } catch {
    res.status(500).json({ success: false, message: 'Server error creating store.' });
  }
};
