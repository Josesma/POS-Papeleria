import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';
import { createProductSchema, updateProductSchema, updateStockSchema, productQuerySchema } from '../validators/product.validator';

export class ProductController {
  /**
   * GET /api/products
   */
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const query = productQuerySchema.parse(req.query);
      const result = await ProductService.getAll(query);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/products/categories
   */
  static async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await ProductService.getCategories();
      res.json({ success: true, data: categories });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/products/:id
   */
  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ success: false, error: 'ID de producto inválido' });
        return;
      }
      const product = await ProductService.getById(id);
      res.json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/products
   */
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createProductSchema.parse(req.body);
      const product = await ProductService.create(data);
      res.status(201).json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/products/:id
   */
  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ success: false, error: 'ID de producto inválido' });
        return;
      }
      const data = updateProductSchema.parse(req.body);
      const product = await ProductService.update(id, data);
      res.json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/products/:id/stock
   */
  static async updateStock(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ success: false, error: 'ID de producto inválido' });
        return;
      }
      const { stock } = updateStockSchema.parse(req.body);
      const product = await ProductService.updateStock(id, stock);
      res.json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }
}
