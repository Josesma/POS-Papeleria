import { prisma } from '../lib/prisma';

export class SupplierService {
  static async getAll() {
    return prisma.supplier.findMany({
      orderBy: { name: 'asc' },
    });
  }

  static async getById(id: number) {
    return prisma.supplier.findUnique({
      where: { id },
      include: {
        purchases: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });
  }

  static async create(data: any) {
    return prisma.supplier.create({
      data,
    });
  }

  static async update(id: number, data: any) {
    return prisma.supplier.update({
      where: { id },
      data,
    });
  }

  static async delete(id: number) {
    // Check if supplier has purchases to avoid foreign key constraints
    const hasPurchases = await prisma.purchase.count({ where: { supplierId: id } });
    if (hasPurchases > 0) {
      const error = new Error('No se puede eliminar el proveedor porque tiene compras asociadas') as Error & { statusCode: number };
      error.statusCode = 400;
      throw error;
    }
    return prisma.supplier.delete({
      where: { id },
    });
  }

  static async search(term: string) {
    return prisma.supplier.findMany({
      where: {
        OR: [
          { name: { contains: term } },
          { contact: { contains: term } },
          { email: { contains: term } },
        ],
      },
      take: 10,
    });
  }
}
