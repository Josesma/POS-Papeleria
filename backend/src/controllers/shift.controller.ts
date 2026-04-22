import { Request, Response, NextFunction } from 'express';
import { ShiftService } from '../services/shift.service';
import { z } from 'zod';

const openShiftSchema = z.object({
  initialBalance: z.number().min(0),
});

const closeShiftSchema = z.object({
  actualBalance: z.number().min(0),
});

export class ShiftController {
  static async getActiveShift(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const shift = await ShiftService.getActiveShift(userId);
      res.json({ success: true, data: shift });
    } catch (error) {
      next(error);
    }
  }

  static async open(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { initialBalance } = openShiftSchema.parse(req.body);
      const shift = await ShiftService.openShift(userId, initialBalance);
      res.status(201).json({ success: true, data: shift });
    } catch (error) {
      next(error);
    }
  }

  static async close(req: Request, res: Response, next: NextFunction) {
    try {
      const { actualBalance } = closeShiftSchema.parse(req.body);
      const shiftId = parseInt(req.params.id);
      const shift = await ShiftService.closeShift(shiftId, actualBalance);
      res.json({ success: true, data: shift });
    } catch (error) {
      next(error);
    }
  }
}
