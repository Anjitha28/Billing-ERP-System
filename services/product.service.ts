import { prisma } from "@/lib/prisma";
import { PrismaClient, ProductType } from "@prisma/client";


export type CreateProductInput = {
  name: string;
  description?: string | null;
  type: ProductType;
  hsnSacCode: string;
  unit: string;
  sellingPrice: string | number; // Handling decimal input via string or number
  customPrice?: string | number | null;
  purchasePrice?: string | number | null;
  gstRate: string | number;
  cessRate?: string | number | null;
};

export type UpdateProductInput = Partial<CreateProductInput>;

export class ProductService {
  /**
   * Fetch all products with optional filtering and search
   */
  static async getProducts(params?: {
    search?: string;
    type?: ProductType;
    isActive?: boolean;
  }) {
    const { search, type, isActive } = params || {};

    const where: any = {};

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (type) {
      where.type = type;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { hsnSacCode: { contains: search } },
      ];
    }

    return await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Fetch a single product by ID
   */
  static async getProductById(id: string) {
    return await prisma.product.findUnique({
      where: { id },
    });
  }

  /**
   * Create a new product
   */
  static async createProduct(data: CreateProductInput) {
    return await prisma.product.create({
      data: {
        ...data,
        // Convert string inputs to Prisma Decimal using string constructor if necessary, Prisma Decimal accepts strings or numbers
        sellingPrice: data.sellingPrice,
        customPrice: data.customPrice || null,
        purchasePrice: data.purchasePrice || null,
        gstRate: data.gstRate,
        cessRate: data.cessRate || null,
      },
    });
  }

  /**
   * Update an existing product
   */
  static async updateProduct(id: string, data: UpdateProductInput) {
    return await prisma.product.update({
      where: { id },
      data,
    });
  }

  /**
   * Soft deactivate a product
   */
  static async deactivateProduct(id: string) {
    return await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Reactivate a product
   */
  static async reactivateProduct(id: string) {
    return await prisma.product.update({
      where: { id },
      data: { isActive: true },
    });
  }
}
