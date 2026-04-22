import { Router } from 'express';
import { SaleController } from '../controllers/sale.controller';

const router = Router();

router.get('/', SaleController.getAll);
router.get('/stats', SaleController.getStats);
router.get('/:id', SaleController.getById);
router.post('/', SaleController.create);
router.delete('/:id', SaleController.delete);

export default router;
