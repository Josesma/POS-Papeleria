import { Router } from 'express';
import { CustomerController } from '../controllers/customer.controller';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/', CustomerController.getAll);
router.get('/search', CustomerController.search);
router.get('/:id/sales', CustomerController.getSales);
router.post('/', CustomerController.create);
router.put('/:id', CustomerController.update);
router.delete('/:id', CustomerController.delete);

export default router;
