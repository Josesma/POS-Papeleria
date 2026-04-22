import { Request, Response, NextFunction } from 'express';
import { CustomerService } from '../services/customer.service';
import { createCustomerSchema, updateCustomerSchema } from '../validators/customer.validator';

export class CustomerController {
  static async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const customers = await CustomerService.getAll();
      res.json({ success: true, data: customers });
    } catch (error) {
      next(error);
    }
  }

  static async search(req: Request, res: Response, next: NextFunction) {
    try {
      const term = req.query.term as string;
      const customers = await CustomerService.search(term || '');
      res.json({ success: true, data: customers });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createCustomerSchema.parse(req.body);
      const customer = await CustomerService.create(data);
      res.status(201).json({ success: true, data: customer });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const data = updateCustomerSchema.parse(req.body);
      const customer = await CustomerService.update(id, data);
      res.json({ success: true, data: customer });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      await CustomerService.delete(id);
      res.json({ success: true, data: null });
    } catch (error) {
      next(error);
    }
  }

  static async getSales(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const sales = await CustomerService.getSales(id);
      res.json({ success: true, data: sales });
    } catch (error) {
      next(error);
    }
  }
}
