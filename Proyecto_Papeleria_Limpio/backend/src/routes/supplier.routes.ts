import { Router } from 'express';
import { SupplierController } from '../controllers/supplier.controller';
import { asyncHandler } from '../utils/asyncHandler';
import { authMiddleware, adminMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/search', asyncHandler(SupplierController.search));
router.get('/', asyncHandler(SupplierController.getAll));
router.get('/:id', asyncHandler(SupplierController.getById));

// Only admins can create/edit/delete suppliers natively
router.post('/', adminMiddleware, asyncHandler(SupplierController.create));
router.put('/:id', adminMiddleware, asyncHandler(SupplierController.update));
router.delete('/:id', adminMiddleware, asyncHandler(SupplierController.delete));

export default router;
