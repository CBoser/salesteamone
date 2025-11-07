import { PrismaClient, Material, MaterialPricing, Prisma } from '@prisma/client';
import { db } from './database';

export interface CreateMaterialInput {
  name: string;
  sku?: string;
  category: string;
  unit: string;
  description?: string;
  manufacturer?: string;
  notes?: string;
  isActive?: boolean;
}

export interface UpdateMaterialInput {
  name?: string;
  sku?: string;
  category?: string;
  unit?: string;
  description?: string;
  manufacturer?: string;
  notes?: string;
  isActive?: boolean;
}

export interface ListMaterialsQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  isActive?: boolean;
  sortBy?: 'name' | 'category' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateMaterialPricingInput {
  materialId: string;
  supplierId?: string;
  pricePerUnit: number;
  effectiveDate: Date;
  source?: string;
  notes?: string;
}

export interface UpdateMaterialPricingInput {
  supplierId?: string;
  pricePerUnit?: number;
  effectiveDate?: Date;
  source?: string;
  notes?: string;
}

class MaterialService {
  /**
   * Create a new material
   */
  async createMaterial(input: CreateMaterialInput): Promise<Material> {
    try {
      const material = await db.material.create({
        data: {
          name: input.name,
          sku: input.sku,
          category: input.category,
          unit: input.unit,
          description: input.description,
          manufacturer: input.manufacturer,
          notes: input.notes,
          isActive: input.isActive ?? true,
        },
      });

      return material;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('A material with this SKU already exists');
        }
      }
      throw error;
    }
  }

  /**
   * Get material by ID
   */
  async getMaterialById(id: string, includeRelations = false) {
    const material = await db.material.findUnique({
      where: { id },
      include: includeRelations
        ? {
            pricing: {
              orderBy: { effectiveDate: 'desc' },
              take: 10, // Last 10 price records
              include: {
                supplier: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            planTemplateItems: {
              select: {
                id: true,
                plan: {
                  select: {
                    id: true,
                    name: true,
                    planNumber: true,
                  },
                },
                quantity: true,
                unit: true,
              },
              take: 5,
            },
          }
        : undefined,
    });

    return material;
  }

  /**
   * List materials with filtering and pagination
   */
  async listMaterials(query: ListMaterialsQuery = {}) {
    const {
      page = 1,
      limit = 50,
      search,
      category,
      isActive,
      sortBy = 'name',
      sortOrder = 'asc',
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.MaterialWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { manufacturer: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = { contains: category, mode: 'insensitive' };
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Execute query with count
    const [materials, total] = await Promise.all([
      db.material.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          pricing: {
            orderBy: { effectiveDate: 'desc' },
            take: 1, // Latest price only
            select: {
              id: true,
              pricePerUnit: true,
              effectiveDate: true,
              supplier: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          _count: {
            select: {
              planTemplateItems: true,
              pricing: true,
            },
          },
        },
      }),
      db.material.count({ where }),
    ]);

    return {
      data: materials,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update material
   */
  async updateMaterial(id: string, input: UpdateMaterialInput): Promise<Material> {
    try {
      const material = await db.material.update({
        where: { id },
        data: input,
      });

      return material;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Material not found');
        }
        if (error.code === 'P2002') {
          throw new Error('A material with this SKU already exists');
        }
      }
      throw error;
    }
  }

  /**
   * Soft delete material (set isActive to false)
   */
  async deactivateMaterial(id: string): Promise<Material> {
    try {
      const material = await db.material.update({
        where: { id },
        data: { isActive: false },
      });

      return material;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Material not found');
        }
      }
      throw error;
    }
  }

  /**
   * Reactivate material
   */
  async activateMaterial(id: string): Promise<Material> {
    try {
      const material = await db.material.update({
        where: { id },
        data: { isActive: true },
      });

      return material;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Material not found');
        }
      }
      throw error;
    }
  }

  /**
   * Hard delete material (use with caution)
   */
  async deleteMaterial(id: string): Promise<void> {
    try {
      await db.material.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Material not found');
        }
        if (error.code === 'P2003') {
          throw new Error(
            'Cannot delete material with existing plan templates or pricing. Deactivate instead.'
          );
        }
      }
      throw error;
    }
  }

  /**
   * Get material categories (unique list)
   */
  async getCategories(): Promise<string[]> {
    const materials = await db.material.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });

    return materials.map((m) => m.category);
  }

  // ====== PRICING OPERATIONS ======

  /**
   * Create material pricing record
   */
  async createPricing(input: CreateMaterialPricingInput): Promise<MaterialPricing> {
    try {
      // Verify material exists
      const material = await db.material.findUnique({
        where: { id: input.materialId },
      });

      if (!material) {
        throw new Error('Material not found');
      }

      // Verify supplier exists if provided
      if (input.supplierId) {
        const supplier = await db.supplier.findUnique({
          where: { id: input.supplierId },
        });

        if (!supplier) {
          throw new Error('Supplier not found');
        }
      }

      const pricing = await db.materialPricing.create({
        data: {
          materialId: input.materialId,
          supplierId: input.supplierId,
          pricePerUnit: input.pricePerUnit,
          effectiveDate: input.effectiveDate,
          source: input.source,
          notes: input.notes,
        },
        include: {
          supplier: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return pricing;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get pricing by ID
   */
  async getPricingById(id: string) {
    const pricing = await db.materialPricing.findUnique({
      where: { id },
      include: {
        material: {
          select: {
            id: true,
            name: true,
            sku: true,
            unit: true,
          },
        },
        supplier: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return pricing;
  }

  /**
   * List pricing history for a material
   */
  async listMaterialPricing(materialId: string, limit = 50) {
    const pricing = await db.materialPricing.findMany({
      where: { materialId },
      orderBy: { effectiveDate: 'desc' },
      take: limit,
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return pricing;
  }

  /**
   * Get current (latest) price for a material
   */
  async getCurrentPrice(materialId: string, supplierId?: string) {
    const where: Prisma.MaterialPricingWhereInput = {
      materialId,
      effectiveDate: {
        lte: new Date(),
      },
    };

    if (supplierId) {
      where.supplierId = supplierId;
    }

    const pricing = await db.materialPricing.findFirst({
      where,
      orderBy: { effectiveDate: 'desc' },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return pricing;
  }

  /**
   * Get price at a specific date
   */
  async getPriceAtDate(materialId: string, date: Date, supplierId?: string) {
    const where: Prisma.MaterialPricingWhereInput = {
      materialId,
      effectiveDate: {
        lte: date,
      },
    };

    if (supplierId) {
      where.supplierId = supplierId;
    }

    const pricing = await db.materialPricing.findFirst({
      where,
      orderBy: { effectiveDate: 'desc' },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return pricing;
  }

  /**
   * Update pricing record
   */
  async updatePricing(id: string, input: UpdateMaterialPricingInput): Promise<MaterialPricing> {
    try {
      // Verify supplier exists if being updated
      if (input.supplierId) {
        const supplier = await db.supplier.findUnique({
          where: { id: input.supplierId },
        });

        if (!supplier) {
          throw new Error('Supplier not found');
        }
      }

      const pricing = await db.materialPricing.update({
        where: { id },
        data: input,
        include: {
          supplier: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return pricing;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Pricing record not found');
        }
      }
      throw error;
    }
  }

  /**
   * Delete pricing record
   */
  async deletePricing(id: string): Promise<void> {
    try {
      await db.materialPricing.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Pricing record not found');
        }
      }
      throw error;
    }
  }

  /**
   * Get pricing statistics for a material
   */
  async getPricingStats(materialId: string, days = 365) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const pricing = await db.materialPricing.findMany({
      where: {
        materialId,
        effectiveDate: {
          gte: startDate,
        },
      },
      orderBy: { effectiveDate: 'asc' },
      select: {
        pricePerUnit: true,
        effectiveDate: true,
      },
    });

    if (pricing.length === 0) {
      return null;
    }

    const prices = pricing.map((p) => p.pricePerUnit.toNumber());
    const currentPrice = prices[prices.length - 1];
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    return {
      currentPrice,
      avgPrice,
      minPrice,
      maxPrice,
      priceCount: pricing.length,
      firstDate: pricing[0].effectiveDate,
      lastDate: pricing[pricing.length - 1].effectiveDate,
      priceHistory: pricing,
    };
  }
}

export const materialService = new MaterialService();
