import { prisma } from '../lib/prisma';
import { CreateSaleInput, SaleQueryParams } from '../types';

const TAX_RATE = 0.16; // IVA 16%

export class SaleService {
  /**
   * Create a sale with atomic transaction:
   * 1. Validate stock for all items
   * 2. Create sale + sale items
   * 3. Deduct stock for each product
   */
  static async create(data: CreateSaleInput, userId?: number) {
    if (!data.shiftId) {
      const error = new Error('Se requiere un turno abierto para realizar ventas') as Error & { statusCode: number };
      error.statusCode = 400;
      throw error;
    }

    return prisma.$transaction(async (tx) => {
      // 0. Validate shift status and ownership
      const shift = await tx.shift.findFirst({
        where: { id: data.shiftId, userId, status: 'OPEN' }
      });

      if (!shift) {
        const error = new Error('El turno no existe, está cerrado o no te pertenece') as Error & { statusCode: number };
        error.statusCode = 403;
        throw error;
      }

      // 1. Fetch and validate all products
      const productIds = data.items.map((item) => item.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds }, isActive: true },
      });

      if (products.length !== productIds.length) {
        const foundIds = products.map((p) => p.id);
        const missingIds = productIds.filter((id) => !foundIds.includes(id));
        const error = new Error(`Productos no encontrados: ${missingIds.join(', ')}`) as Error & { statusCode: number };
        error.statusCode = 404;
        throw error;
      }

      // 2. Validate stock and calculate totals
      let subtotal = 0;
      const saleItems: Array<{
        productId: number;
        quantity: number;
        unitPrice: number;
        subtotal: number;
      }> = [];

      for (const item of data.items) {
        const product = products.find((p) => p.id === item.productId)!;

        if (product.stock < item.quantity) {
          const error = new Error(`Stock insuficiente para "${product.name}". Disponible: ${product.stock}`) as Error & { statusCode: number };
          error.statusCode = 400;
          throw error;
        }

        const itemSubtotal = Math.round(product.price * item.quantity * 100) / 100;
        subtotal += itemSubtotal;

        saleItems.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: product.price,
          subtotal: itemSubtotal,
        });
      }

      // 3. Calculate tax, discount and total
      subtotal = Math.round(subtotal * 100) / 100;
      const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
      const discount = data.discount || 0;
      
      // Total = (Subtotal + Tax) - Discount
      const total = Math.round((subtotal + tax - discount) * 100) / 100;

      // 4. Create sale with items
      const sale = await tx.sale.create({
        data: {
          subtotal,
          tax,
          discount,
          total,
          paymentMethod: data.paymentMethod || 'CASH',
          amountReceived: data.amountReceived || total,
          changeProduced: data.changeProduced || 0,
          notes: data.notes,
          customerId: data.customerId,
          userId: userId,
          shiftId: data.shiftId,
          items: {
            create: saleItems,
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: { id: true, name: true, barcode: true },
              },
            },
          },
          user: { select: { id: true, name: true, role: true } },
          customer: true,
        },
      });

      // 5. Deduct stock and update shift balance
      for (const item of data.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Only update expected balance if payment is CASH (usually how shifts work)
      // but for simple reconciliation we track total sales
      await tx.shift.update({
        where: { id: data.shiftId },
        data: { expectedBalance: { increment: total } }
      });

      return sale;
    });
  }

  /**
   * Get all sales with pagination and date filter
   */
  static async getAll(params: SaleQueryParams) {
    const page = parseInt(params.page || '1');
    const limit = parseInt(params.limit || '20');
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (params.from || params.to) {
      where.createdAt = {};
      if (params.from) (where.createdAt as Record<string, unknown>).gte = new Date(params.from);
      if (params.to) (where.createdAt as Record<string, unknown>).lte = new Date(params.to);
    }

    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  barcode: true,
                },
              },
            },
          },
        },
      }),
      prisma.sale.count({ where }),
    ]);

    return {
      sales,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single sale by ID with items
   */
  static async getById(id: number) {
    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                barcode: true,
                category: true,
              },
            },
          },
        },
      },
    });

    if (!sale) {
      const error = new Error('Venta no encontrada') as Error & { statusCode: number };
      error.statusCode = 404;
      throw error;
    }

    return sale;
  }

  /**
   * Get sales statistics for dashboard
   */
  static async getStats() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get sales from last 7 days
    const recentSales = await prisma.sale.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // 1. Daily Sales Totals
    const dailySales: Record<string, number> = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      dailySales[dateStr] = 0;
    }

    recentSales.forEach((sale) => {
      const dateStr = sale.createdAt.toISOString().split('T')[0];
      if (dailySales[dateStr] !== undefined) {
        dailySales[dateStr] += sale.total;
      }
    });

    const dailyData = Object.entries(dailySales)
      .map(([date, total]) => ({ date, total: Math.round(total * 100) / 100 }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // 2. Sales by Category
    const categorySales: Record<string, number> = {};
    recentSales.forEach((sale) => {
      sale.items.forEach((item) => {
        const cat = item.product.category || 'General';
        categorySales[cat] = (categorySales[cat] || 0) + item.subtotal;
      });
    });

    const categoryData = Object.entries(categorySales).map(([name, value]) => ({
      name,
      value: Math.round(value * 100) / 100,
    }));

    // 3. Summary Stats
    const totalRevenue = recentSales.reduce((acc, s) => acc + s.total, 0);
    const totalSalesCount = recentSales.length;
    const avgTicket = totalSalesCount > 0 ? totalRevenue / totalSalesCount : 0;

    return {
      dailyData,
      categoryData,
      summary: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalSalesCount,
        avgTicket: Math.round(avgTicket * 100) / 100,
      },
    };
  }

  /**
   * Cancel a sale (Return):
   * 1. Revert stock for all items
   * 2. Delete sale items first
   * 3. Delete sale
   */
  static async cancel(id: number) {
    return prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!sale) {
        const error = new Error('Venta no encontrada') as Error & { statusCode: number };
        error.statusCode = 404;
        throw error;
      }

      // Revert stock
      for (const item of sale.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      // Decrement shift balance
      if (sale.shiftId) {
        await tx.shift.update({
          where: { id: sale.shiftId },
          data: { expectedBalance: { decrement: sale.total } },
        });
      }

      // Delete sale items first manually (no cascade in schema)
      await tx.saleItem.deleteMany({ where: { saleId: id } });

      // Delete sale
      return tx.sale.delete({ where: { id } });
    });
  }
}
