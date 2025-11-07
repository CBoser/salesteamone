import { PrismaClient, Plan, PlanTemplateItem, Prisma } from '@prisma/client';
import { db } from './database';

export interface CreatePlanInput {
  customerId: string;
  name: string;
  planNumber?: string;
  squareFootage?: number;
  bedrooms?: number;
  bathrooms?: number;
  stories?: number;
  garageSpaces?: number;
  description?: string;
  notes?: string;
  isActive?: boolean;
}

export interface UpdatePlanInput {
  customerId?: string;
  name?: string;
  planNumber?: string;
  squareFootage?: number;
  bedrooms?: number;
  bathrooms?: number;
  stories?: number;
  garageSpaces?: number;
  description?: string;
  notes?: string;
  isActive?: boolean;
}

export interface ListPlansQuery {
  page?: number;
  limit?: number;
  search?: string;
  customerId?: string;
  isActive?: boolean;
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'squareFootage';
  sortOrder?: 'asc' | 'desc';
}

export interface CreatePlanTemplateItemInput {
  planId: string;
  materialId: string;
  category: string;
  quantity: number;
  unit: string;
  notes?: string;
}

export interface UpdatePlanTemplateItemInput {
  quantity?: number;
  unit?: string;
  notes?: string;
  averageVariance?: number;
  varianceCount?: number;
  lastVarianceDate?: Date;
  confidenceScore?: number;
}

class PlanService {
  /**
   * Create a new plan
   */
  async createPlan(input: CreatePlanInput): Promise<Plan> {
    try {
      // Verify customer exists
      const customer = await db.customer.findUnique({
        where: { id: input.customerId },
      });

      if (!customer) {
        throw new Error('Customer not found');
      }

      const plan = await db.plan.create({
        data: {
          customerId: input.customerId,
          name: input.name,
          planNumber: input.planNumber,
          squareFootage: input.squareFootage,
          bedrooms: input.bedrooms,
          bathrooms: input.bathrooms,
          stories: input.stories,
          garageSpaces: input.garageSpaces,
          description: input.description,
          notes: input.notes,
          isActive: input.isActive ?? true,
        },
      });

      return plan;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('A plan with this name already exists for this customer');
        }
      }
      throw error;
    }
  }

  /**
   * Get plan by ID
   */
  async getPlanById(id: string, includeRelations = false) {
    const plan = await db.plan.findUnique({
      where: { id },
      include: includeRelations
        ? {
            customer: {
              select: {
                id: true,
                name: true,
              },
            },
            templateItems: {
              include: {
                material: {
                  select: {
                    id: true,
                    name: true,
                    sku: true,
                    unit: true,
                  },
                },
              },
              orderBy: { category: 'asc' },
            },
            communities: {
              select: {
                id: true,
                name: true,
                isActive: true,
              },
            },
            lots: {
              select: {
                id: true,
                lotNumber: true,
                address: true,
              },
            },
          }
        : {
            customer: {
              select: {
                id: true,
                name: true,
              },
            },
          },
    });

    return plan;
  }

  /**
   * List plans with filtering and pagination
   */
  async listPlans(query: ListPlansQuery = {}) {
    const {
      page = 1,
      limit = 50,
      search,
      customerId,
      isActive,
      sortBy = 'name',
      sortOrder = 'asc',
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.PlanWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { planNumber: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (customerId) {
      where.customerId = customerId;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Execute query with count
    const [plans, total] = await Promise.all([
      db.plan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              templateItems: true,
              lots: true,
              jobs: true,
              communities: true,
            },
          },
        },
      }),
      db.plan.count({ where }),
    ]);

    return {
      data: plans,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update plan
   */
  async updatePlan(id: string, input: UpdatePlanInput): Promise<Plan> {
    try {
      // If customerId is being updated, verify new customer exists
      if (input.customerId) {
        const customer = await db.customer.findUnique({
          where: { id: input.customerId },
        });

        if (!customer) {
          throw new Error('Customer not found');
        }
      }

      const plan = await db.plan.update({
        where: { id },
        data: input,
      });

      return plan;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Plan not found');
        }
        if (error.code === 'P2002') {
          throw new Error('A plan with this name already exists for this customer');
        }
      }
      throw error;
    }
  }

  /**
   * Soft delete plan (set isActive to false)
   */
  async deactivatePlan(id: string): Promise<Plan> {
    try {
      const plan = await db.plan.update({
        where: { id },
        data: { isActive: false },
      });

      return plan;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Plan not found');
        }
      }
      throw error;
    }
  }

  /**
   * Reactivate plan
   */
  async activatePlan(id: string): Promise<Plan> {
    try {
      const plan = await db.plan.update({
        where: { id },
        data: { isActive: true },
      });

      return plan;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Plan not found');
        }
      }
      throw error;
    }
  }

  /**
   * Hard delete plan (use with caution)
   */
  async deletePlan(id: string): Promise<void> {
    try {
      await db.plan.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Plan not found');
        }
        if (error.code === 'P2003') {
          throw new Error(
            'Cannot delete plan with existing lots, jobs, or communities. Deactivate instead.'
          );
        }
      }
      throw error;
    }
  }

  /**
   * Get plan statistics
   */
  async getPlanStats(id: string) {
    const stats = await db.plan.findUnique({
      where: { id },
      select: {
        _count: {
          select: {
            templateItems: true,
            lots: true,
            jobs: true,
            communities: true,
          },
        },
        templateItems: {
          select: {
            confidenceScore: true,
            varianceCount: true,
          },
        },
      },
    });

    if (!stats) {
      throw new Error('Plan not found');
    }

    // Calculate average confidence score
    const templateItems = stats.templateItems;
    const avgConfidence =
      templateItems.length > 0
        ? templateItems.reduce((sum, item) => sum + (item.confidenceScore?.toNumber() || 0), 0) /
          templateItems.length
        : 0;

    const totalVarianceRecords = templateItems.reduce(
      (sum, item) => sum + (item.varianceCount || 0),
      0
    );

    return {
      totalTemplateItems: stats._count.templateItems,
      totalLots: stats._count.lots,
      totalJobs: stats._count.jobs,
      totalCommunities: stats._count.communities,
      avgConfidenceScore: avgConfidence,
      totalVarianceRecords,
    };
  }

  // ====== TEMPLATE ITEM OPERATIONS ======

  /**
   * Create plan template item
   */
  async createTemplateItem(input: CreatePlanTemplateItemInput): Promise<PlanTemplateItem> {
    try {
      // Verify plan and material exist
      const [plan, material] = await Promise.all([
        db.plan.findUnique({ where: { id: input.planId } }),
        db.material.findUnique({ where: { id: input.materialId } }),
      ]);

      if (!plan) {
        throw new Error('Plan not found');
      }

      if (!material) {
        throw new Error('Material not found');
      }

      const templateItem = await db.planTemplateItem.create({
        data: {
          planId: input.planId,
          materialId: input.materialId,
          category: input.category,
          quantity: input.quantity,
          unit: input.unit,
          notes: input.notes,
          confidenceScore: 0.0, // Start with 0 confidence
          varianceCount: 0,
        },
        include: {
          material: true,
        },
      });

      return templateItem;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('This material is already in the plan template');
        }
      }
      throw error;
    }
  }

  /**
   * Get template item by ID
   */
  async getTemplateItemById(id: string) {
    const item = await db.planTemplateItem.findUnique({
      where: { id },
      include: {
        plan: {
          select: {
            id: true,
            name: true,
            planNumber: true,
          },
        },
        material: true,
      },
    });

    return item;
  }

  /**
   * List template items for a plan
   */
  async listTemplateItems(planId: string) {
    const items = await db.planTemplateItem.findMany({
      where: { planId },
      include: {
        material: true,
      },
      orderBy: [{ category: 'asc' }, { material: { name: 'asc' } }],
    });

    return items;
  }

  /**
   * Update template item
   */
  async updateTemplateItem(
    id: string,
    input: UpdatePlanTemplateItemInput
  ): Promise<PlanTemplateItem> {
    try {
      const item = await db.planTemplateItem.update({
        where: { id },
        data: input,
        include: {
          material: true,
        },
      });

      return item;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Template item not found');
        }
      }
      throw error;
    }
  }

  /**
   * Delete template item
   */
  async deleteTemplateItem(id: string): Promise<void> {
    try {
      await db.planTemplateItem.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Template item not found');
        }
      }
      throw error;
    }
  }

  /**
   * Update template item variance data (called by learning system)
   */
  async updateTemplateItemVariance(
    id: string,
    variance: {
      averageVariance: number;
      varianceCount: number;
      confidenceScore: number;
    }
  ): Promise<PlanTemplateItem> {
    try {
      const item = await db.planTemplateItem.update({
        where: { id },
        data: {
          averageVariance: variance.averageVariance,
          varianceCount: variance.varianceCount,
          confidenceScore: variance.confidenceScore,
          lastVarianceDate: new Date(),
        },
        include: {
          material: true,
        },
      });

      return item;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Template item not found');
        }
      }
      throw error;
    }
  }
}

export const planService = new PlanService();
