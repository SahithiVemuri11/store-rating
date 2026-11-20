import { Router } from 'express';
import { getDashboard, getUsers, createUser, getStores, createStore } from '../controllers/admin.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate';
import { createUserSchema, createStoreSchema } from '../validations/schemas';

const router = Router();

// All admin routes require authentication + ADMIN role
router.use(authenticate, authorize('ADMIN'));

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.post('/users', validate(createUserSchema), createUser);
router.get('/stores', getStores);
router.post('/stores', validate(createStoreSchema), createStore);

export default router;
