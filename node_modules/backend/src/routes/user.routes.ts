import { Router } from 'express';
import { getStores, submitRating } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate';
import { submitRatingSchema } from '../validations/schemas';

const router = Router();

router.use(authenticate, authorize('NORMAL_USER'));

router.get('/stores', getStores);
router.post('/ratings', validate(submitRatingSchema), submitRating);

export default router;
