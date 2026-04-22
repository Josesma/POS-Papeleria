import { Request, Response, NextFunction } from 'express';
import { SaleService } from '../services/sale.service';
import { createSaleSchema, saleQuerySchema } from '../validators/sale.validator';

export class SaleController {
  /**
   * POST /api/sales
   */
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createSaleSchema.parse(req.body);
      const userId = (req as any).user.id;
      const sale = await SaleService.create(data, userId);
      res.status(201).json({ success: true, data: sale });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/sales
   */
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const query = saleQuerySchema.parse(req.query);
      const result = await SaleService.getAll(query);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/sales/:id
   */
  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ success: false, error: 'ID de venta inválido' });
        return;
      }
      const sale = await SaleService.getById(id);
      res.json({ success: true, data: sale });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/sales/stats
   */
  static async getStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await SaleService.getStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/sales/:id (Cancel/Return)
   */
  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ success: false, error: 'ID de venta inválido' });
        return;
      }
      await SaleService.cancel(id);
      res.json({ success: true, message: 'Venta cancelada y stock devuelto' });
    } catch (error) {
      next(error);
    }
  }
}
