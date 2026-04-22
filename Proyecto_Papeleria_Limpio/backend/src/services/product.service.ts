import { prisma } from '../lib/prisma';
import { CreateProductInput, UpdateProductInput, ProductQueryParams } from '../types';

const TAX_RATE = 0.16; // IVA 16%

export class ProductService {
  /**
   * Get all products with optional search and category filters
   */
  static async getAll(params: ProductQueryParams) {
    const page = parseInt(params.page || '1');
    const limit = parseInt(params.limit || '50');
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      isActive: true,
    };

    if (params.search) {
      where.OR = [
        { name: { contains: params.search } },
        { description: { contains: params.search } },
        { barcode: { contains: params.search } },
      ];
    }

    if (params.category && params.category !== 'Todas') {
      where.category = params.category;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single product by ID
   */
  static async getById(id: number) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      const error = new Error('Producto no encontrado') as Error & { statusCode: number };
      error.statusCode = 404;
      throw error;
    }
    return product;
  }

  /**
   * Create a new product
   */
  static async create(data: CreateProductInput) {
    if (data.barcode) {
      const existing = await prisma.product.findUnique({
        where: { barcode: data.barcode },
      });
      if (existing) {
        const error = new Error('Ya existe un producto con ese código de barras') as Error & { statusCode: number };
        error.statusCode = 409;
        throw error;
      }
    }

    return prisma.product.create({ data });
  }

  /**
   * Update an existing product
   */
  static async update(id: number, data: UpdateProductInput) {
    await ProductService.getById(id); // Throws 404 if not found

    if (data.barcode) {
      const existing = await prisma.product.findFirst({
        where: {
          barcode: data.barcode,
          NOT: { id },
        },
      });
      if (existing) {
        const error = new Error('Ya existe otro producto con ese código de barras') as Error & { statusCode: number };
        error.statusCode = 409;
        throw error;
      }
    }

    return prisma.product.update({
      where: { id },
      data,
    });
  }

  /**
   * Update product stock
   */
  static async updateStock(id: number, stock: number) {
    await ProductService.getById(id); // Throws 404 if not found
    return prisma.product.update({
      where: { id },
      data: { stock },
    });
  }

  /**
   * Get all unique categories
   */
  static async getCategories() {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });
    return products.map((p) => p.category);
  }
}
