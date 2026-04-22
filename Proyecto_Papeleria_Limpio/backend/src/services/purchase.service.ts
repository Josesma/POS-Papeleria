import { prisma } from '../lib/prisma';

export interface CreatePurchaseInput {
  supplierId: number;
  userId: number; // The user creating the purchase entry
  notes?: string;
  items: Array<{
    productId: number;
    quantity: number;
    unitCost: number;
  }>;
}

export class PurchaseService {
  static async getAll(page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const [purchases, total] = await Promise.all([
      prisma.purchase.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          supplier: {
             select: { id: true, name: true }
          },
          user: {
             select: { id: true, name: true, email: true }
          },
          items: true,
        },
      }),
      prisma.purchase.count(),
    ]);

    return {
      purchases,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    };
  }

  static async getById(folioOrId: string | number) {
    return prisma.purchase.findFirst({
      where: typeof folioOrId === 'number' ? { id: folioOrId } : { folio: folioOrId },
      include: {
        supplier: true,
        user: { select: { id: true, name: true } },
        items: {
          include: {
            product: { select: { id: true, name: true, barcode: true } }
          }
        }
      }
    });
  }

  static async create(data: CreatePurchaseInput) {
    if (!data.items || data.items.length === 0) {
      throw { statusCode: 400, message: 'La compra debe incluir al menos un artículo' };
    }

    // Verify supplier exists
    const supplier = await prisma.supplier.findUnique({ where: { id: data.supplierId } });
    if (!supplier) {
      throw { statusCode: 404, message: 'Proveedor no encontrado' };
    }

    // Transaction to guarantee consistency
    return prisma.$transaction(async (tx) => {
      let totalCost = 0;
      const itemsData = [];

      for (const item of data.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) {
          throw { statusCode: 404, message: `Producto ID ${item.productId} no encontrado` };
        }

        const subtotal = item.quantity * item.unitCost;
        totalCost += subtotal;

        itemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          unitCost: item.unitCost,
          subtotal: subtotal
        });

        // Update product stock and update cost to the last purchased unitCost
        await tx.product.update({
          where: { id: item.productId },
          data: {
             stock: { increment: item.quantity },
             cost: item.unitCost // Overwrite with new cost for profit calculations later
          }
        });
      }

      // Create purchase record
      const purchase = await tx.purchase.create({
        data: {
          supplierId: data.supplierId,
          userId: data.userId,
          totalCost: totalCost,
          notes: data.notes,
          items: {
            create: itemsData
          }
        },
        include: {
          supplier: true,
          items: { include: { product: true } }
        }
      });

      return purchase;
    });
  }
}
