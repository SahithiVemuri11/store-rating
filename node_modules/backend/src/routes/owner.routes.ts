import { Router } from 'express';
import { getMyStore, getMyStoreRatings } from '../controllers/owner.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';

const router = Router();

router.use(authenticate, authorize('STORE_OWNER'));

router.get('/store', getMyStore);
router.get('/ratings', getMyStoreRatings);

export default router;
