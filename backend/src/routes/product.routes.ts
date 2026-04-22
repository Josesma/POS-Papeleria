import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';

const router = Router();

router.get('/categories', ProductController.getCategories);
router.get('/', ProductController.getAll);
router.get('/:id', ProductController.getById);
router.post('/', ProductController.create);
router.put('/:id', ProductController.update);
router.patch('/:id/stock', ProductController.updateStock);

export default router;
