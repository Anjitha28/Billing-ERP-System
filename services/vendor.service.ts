import { prisma } from "@/lib/prisma";


export class VendorService {
  static async getVendors(params?: { search?: string; isActive?: boolean }) {
    const { search, isActive } = params || {};
    const where: any = {};

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { businessName: { contains: search } },
        { gstin: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    return await prisma.vendor.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { expenses: true }
        }
      }
    });
  }

  static async getVendorById(id: string) {
    return await prisma.vendor.findUnique({
      where: { id },
    });
  }

  static async createVendor(data: {
    name: string;
    businessName?: string | null;
    gstin?: string | null;
    pan?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    stateCode?: string | null;
  }) {
    if (!data.name || data.name.trim() === "") {
      throw new Error("Vendor name is required.");
    }

    if (data.gstin && data.gstin.trim() !== "") {
      const existing = await prisma.vendor.findFirst({
        where: { gstin: data.gstin }
      });
      if (existing) {
        throw new Error("A vendor with this GSTIN already exists.");
      }
    }

    return await prisma.vendor.create({
      data: {
        ...data,
        isActive: true,
      }
    });
  }

  static async updateVendor(id: string, data: Partial<Parameters<typeof VendorService.createVendor>[0]>) {
    if (data.name !== undefined && data.name.trim() === "") {
      throw new Error("Vendor name cannot be empty.");
    }

    if (data.gstin && data.gstin.trim() !== "") {
      const existing = await prisma.vendor.findFirst({
        where: { gstin: data.gstin, id: { not: id } }
      });
      if (existing) {
        throw new Error("Another vendor with this GSTIN already exists.");
      }
    }

    return await prisma.vendor.update({
      where: { id },
      data,
    });
  }

  static async toggleVendorStatus(id: string, isActive: boolean) {
    return await prisma.vendor.update({
      where: { id },
      data: { isActive },
    });
  }
}
