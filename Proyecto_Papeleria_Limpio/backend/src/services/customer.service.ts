import { prisma } from '../lib/prisma';

export class CustomerService {
  static async getAll() {
    return prisma.customer.findMany({
      orderBy: { name: 'asc' },
    });
  }

  static async getById(id: number) {
    return prisma.customer.findUnique({
      where: { id },
    });
  }

  static async create(data: any) {
    return prisma.customer.create({
      data,
    });
  }

  static async update(id: number, data: any) {
    return prisma.customer.update({
      where: { id },
      data,
    });
  }

  static async delete(id: number) {
    return prisma.customer.delete({
      where: { id },
    });
  }

  static async search(term: string) {
    return prisma.customer.findMany({
      where: {
        OR: [
          { name: { contains: term } },
          { phone: { contains: term } },
        ],
      },
      take: 10,
    });
  }

  static async getSales(customerId: number) {
    return prisma.sale.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        }
      }
    });
  }
}
