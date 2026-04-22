import { Router } from 'express';
import { PurchaseController } from '../controllers/purchase.controller';
import { asyncHandler } from '../utils/asyncHandler';
import { authMiddleware, adminMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/', asyncHandler(PurchaseController.getAll));
router.get('/:id', asyncHandler(PurchaseController.getById));
// Only admins can register new stock entries
router.post('/', adminMiddleware, asyncHandler(PurchaseController.create));

export default router;
