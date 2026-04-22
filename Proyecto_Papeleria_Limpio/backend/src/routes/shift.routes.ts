import { Router } from 'express';
import { ShiftController } from '../controllers/shift.controller';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// All shift routes require authentication
router.use(authMiddleware);

router.get('/active', ShiftController.getActiveShift);
router.post('/open', ShiftController.open);
router.post('/:id/close', ShiftController.close);

export default router;
