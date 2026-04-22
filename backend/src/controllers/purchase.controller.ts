import { Request, Response } from 'express';
import { PurchaseService } from '../services/purchase.service';

export class PurchaseController {
  static async getAll(req: Request, res: Response) {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const result = await PurchaseService.getAll(page, limit);
    res.json({ success: true, data: result });
  }

  static async getById(req: Request, res: Response) {
    const purchase = await PurchaseService.getById(req.params.id);
    
    if (!purchase) {
      return res.status(404).json({ success: false, error: 'Compra no encontrada' });
    }
    
    res.json({ success: true, data: purchase });
  }

  static async create(req: Request, res: Response) {
    // Inject userId from authenticated decoded token (mock for now or assume req.user is set)
    // Normally req.user.id is set by authMiddleware
    const userId = (req as any).user?.id || 1; 

    // Extend body with userId
    const purchaseData = {
       ...req.body,
       userId
    };

    const purchase = await PurchaseService.create(purchaseData);
    res.status(201).json({ success: true, data: purchase });
  }
}
