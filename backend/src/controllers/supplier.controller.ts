import { Request, Response } from 'express';
import { SupplierService } from '../services/supplier.service';

export class SupplierController {
  static async getAll(req: Request, res: Response) {
    const suppliers = await SupplierService.getAll();
    res.json({ success: true, data: suppliers });
  }

  static async getById(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const supplier = await SupplierService.getById(id);
    
    if (!supplier) {
      return res.status(404).json({ success: false, error: 'Proveedor no encontrado' });
    }
    
    res.json({ success: true, data: supplier });
  }

  static async create(req: Request, res: Response) {
    const supplier = await SupplierService.create(req.body);
    res.status(201).json({ success: true, data: supplier });
  }

  static async update(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const supplier = await SupplierService.update(id, req.body);
    res.json({ success: true, data: supplier });
  }

  static async delete(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    await SupplierService.delete(id);
    res.json({ success: true, data: { message: 'Proveedor eliminado' } });
  }

  static async search(req: Request, res: Response) {
    const term = req.query.q as string;
    
    if (!term || term.length < 2) {
      return res.json({ success: true, data: [] });
    }

    const suppliers = await SupplierService.search(term);
    res.json({ success: true, data: suppliers });
  }
}
