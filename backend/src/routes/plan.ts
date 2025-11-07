import { Router, Request, Response } from 'express';
import { planService } from '../services/plan';
import { authenticateToken, requireRole } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

// ====== PLAN ROUTES ======

/**
 * @route   POST /api/plans
 * @desc    Create a new plan
 * @access  Private (ADMIN, ESTIMATOR)
 */
router.post(
  '/',
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.ESTIMATOR),
  async (req: Request, res: Response) => {
    try {
      const {
        customerId,
        name,
        planNumber,
        squareFootage,
        bedrooms,
        bathrooms,
        stories,
        garageSpaces,
        description,
        notes,
        isActive,
      } = req.body;

      // Validation
      if (!customerId || customerId.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Customer ID is required',
        });
      }

      if (!name || name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Plan name is required',
        });
      }

      const plan = await planService.createPlan({
        customerId: customerId.trim(),
        name: name.trim(),
        planNumber: planNumber?.trim(),
        squareFootage: squareFootage ? parseFloat(squareFootage) : undefined,
        bedrooms: bedrooms ? parseInt(bedrooms) : undefined,
        bathrooms: bathrooms ? parseFloat(bathrooms) : undefined,
        stories: stories ? parseInt(stories) : undefined,
        garageSpaces: garageSpaces ? parseInt(garageSpaces) : undefined,
        description: description?.trim(),
        notes: notes?.trim(),
        isActive,
      });

      res.status(201).json({
        success: true,
        data: plan,
      });
    } catch (error) {
      console.error('Create plan error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create plan',
      });
    }
  }
);

/**
 * @route   GET /api/plans
 * @desc    List plans with filtering and pagination
 * @access  Private
 */
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '50',
      search,
      customerId,
      isActive,
      sortBy = 'name',
      sortOrder = 'asc',
    } = req.query;

    const result = await planService.listPlans({
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      search: search as string,
      customerId: customerId as string,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      sortBy: sortBy as 'name' | 'createdAt' | 'updatedAt' | 'squareFootage',
      sortOrder: sortOrder as 'asc' | 'desc',
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('List plans error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list plans',
    });
  }
});

/**
 * @route   GET /api/plans/:id
 * @desc    Get plan by ID
 * @access  Private
 */
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { includeRelations = 'false' } = req.query;

    const plan = await planService.getPlanById(id, includeRelations === 'true');

    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'Plan not found',
      });
    }

    res.status(200).json({
      success: true,
      data: plan,
    });
  } catch (error) {
    console.error('Get plan error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get plan',
    });
  }
});

/**
 * @route   GET /api/plans/:id/stats
 * @desc    Get plan statistics
 * @access  Private
 */
router.get('/:id/stats', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const stats = await planService.getPlanStats(id);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Get plan stats error:', error);
    res.status(404).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get plan statistics',
    });
  }
});

/**
 * @route   PUT /api/plans/:id
 * @desc    Update plan
 * @access  Private (ADMIN, ESTIMATOR)
 */
router.put(
  '/:id',
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.ESTIMATOR),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const {
        customerId,
        name,
        planNumber,
        squareFootage,
        bedrooms,
        bathrooms,
        stories,
        garageSpaces,
        description,
        notes,
        isActive,
      } = req.body;

      // Build update object (only include provided fields)
      const updateData: any = {};
      if (customerId !== undefined) updateData.customerId = customerId.trim();
      if (name !== undefined) updateData.name = name.trim();
      if (planNumber !== undefined) updateData.planNumber = planNumber.trim();
      if (squareFootage !== undefined) updateData.squareFootage = parseFloat(squareFootage);
      if (bedrooms !== undefined) updateData.bedrooms = parseInt(bedrooms);
      if (bathrooms !== undefined) updateData.bathrooms = parseFloat(bathrooms);
      if (stories !== undefined) updateData.stories = parseInt(stories);
      if (garageSpaces !== undefined) updateData.garageSpaces = parseInt(garageSpaces);
      if (description !== undefined) updateData.description = description.trim();
      if (notes !== undefined) updateData.notes = notes.trim();
      if (isActive !== undefined) updateData.isActive = isActive;

      const plan = await planService.updatePlan(id, updateData);

      res.status(200).json({
        success: true,
        data: plan,
      });
    } catch (error) {
      console.error('Update plan error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update plan',
      });
    }
  }
);

/**
 * @route   POST /api/plans/:id/deactivate
 * @desc    Deactivate plan
 * @access  Private (ADMIN)
 */
router.post(
  '/:id/deactivate',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const plan = await planService.deactivatePlan(id);

      res.status(200).json({
        success: true,
        data: plan,
      });
    } catch (error) {
      console.error('Deactivate plan error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to deactivate plan',
      });
    }
  }
);

/**
 * @route   POST /api/plans/:id/activate
 * @desc    Activate plan
 * @access  Private (ADMIN)
 */
router.post(
  '/:id/activate',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const plan = await planService.activatePlan(id);

      res.status(200).json({
        success: true,
        data: plan,
      });
    } catch (error) {
      console.error('Activate plan error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to activate plan',
      });
    }
  }
);

/**
 * @route   DELETE /api/plans/:id
 * @desc    Delete plan (hard delete - use with caution)
 * @access  Private (ADMIN only)
 */
router.delete(
  '/:id',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      await planService.deletePlan(id);

      res.status(200).json({
        success: true,
        message: 'Plan deleted successfully',
      });
    } catch (error) {
      console.error('Delete plan error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete plan',
      });
    }
  }
);

// ====== TEMPLATE ITEM ROUTES ======

/**
 * @route   POST /api/plans/:planId/items
 * @desc    Add template item to plan
 * @access  Private (ADMIN, ESTIMATOR)
 */
router.post(
  '/:planId/items',
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.ESTIMATOR),
  async (req: Request, res: Response) => {
    try {
      const { planId } = req.params;
      const { materialId, category, quantity, unit, notes } = req.body;

      // Validation
      if (!materialId || materialId.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Material ID is required',
        });
      }

      if (!category || category.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Category is required',
        });
      }

      if (!quantity || isNaN(parseFloat(quantity))) {
        return res.status(400).json({
          success: false,
          error: 'Valid quantity is required',
        });
      }

      if (!unit || unit.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Unit is required',
        });
      }

      const item = await planService.createTemplateItem({
        planId,
        materialId: materialId.trim(),
        category: category.trim(),
        quantity: parseFloat(quantity),
        unit: unit.trim(),
        notes: notes?.trim(),
      });

      res.status(201).json({
        success: true,
        data: item,
      });
    } catch (error) {
      console.error('Create template item error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create template item',
      });
    }
  }
);

/**
 * @route   GET /api/plans/:planId/items
 * @desc    List template items for a plan
 * @access  Private
 */
router.get('/:planId/items', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { planId } = req.params;

    const items = await planService.listTemplateItems(planId);

    res.status(200).json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error('List template items error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list template items',
    });
  }
});

/**
 * @route   GET /api/plans/items/:itemId
 * @desc    Get template item by ID
 * @access  Private
 */
router.get('/items/:itemId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;

    const item = await planService.getTemplateItemById(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Template item not found',
      });
    }

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error('Get template item error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get template item',
    });
  }
});

/**
 * @route   PUT /api/plans/items/:itemId
 * @desc    Update template item
 * @access  Private (ADMIN, ESTIMATOR)
 */
router.put(
  '/items/:itemId',
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.ESTIMATOR),
  async (req: Request, res: Response) => {
    try {
      const { itemId } = req.params;
      const { quantity, unit, notes } = req.body;

      // Build update object
      const updateData: any = {};
      if (quantity !== undefined) updateData.quantity = parseFloat(quantity);
      if (unit !== undefined) updateData.unit = unit.trim();
      if (notes !== undefined) updateData.notes = notes.trim();

      const item = await planService.updateTemplateItem(itemId, updateData);

      res.status(200).json({
        success: true,
        data: item,
      });
    } catch (error) {
      console.error('Update template item error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update template item',
      });
    }
  }
);

/**
 * @route   DELETE /api/plans/items/:itemId
 * @desc    Delete template item
 * @access  Private (ADMIN, ESTIMATOR)
 */
router.delete(
  '/items/:itemId',
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.ESTIMATOR),
  async (req: Request, res: Response) => {
    try {
      const { itemId } = req.params;

      await planService.deleteTemplateItem(itemId);

      res.status(200).json({
        success: true,
        message: 'Template item deleted successfully',
      });
    } catch (error) {
      console.error('Delete template item error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete template item',
      });
    }
  }
);

export default router;
