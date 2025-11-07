import { Router, Request, Response } from 'express';
import { materialService } from '../services/material';
import { authenticateToken, requireRole } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

// ====== MATERIAL ROUTES ======

/**
 * @route   POST /api/materials
 * @desc    Create a new material
 * @access  Private (ADMIN, ESTIMATOR)
 */
router.post(
  '/',
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.ESTIMATOR),
  async (req: Request, res: Response) => {
    try {
      const { name, sku, category, unit, description, manufacturer, notes, isActive } = req.body;

      // Validation
      if (!name || name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Material name is required',
        });
      }

      if (!category || category.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Category is required',
        });
      }

      if (!unit || unit.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Unit is required',
        });
      }

      const material = await materialService.createMaterial({
        name: name.trim(),
        sku: sku?.trim(),
        category: category.trim(),
        unit: unit.trim(),
        description: description?.trim(),
        manufacturer: manufacturer?.trim(),
        notes: notes?.trim(),
        isActive,
      });

      res.status(201).json({
        success: true,
        data: material,
      });
    } catch (error) {
      console.error('Create material error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create material',
      });
    }
  }
);

/**
 * @route   GET /api/materials
 * @desc    List materials with filtering and pagination
 * @access  Private
 */
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '50',
      search,
      category,
      isActive,
      sortBy = 'name',
      sortOrder = 'asc',
    } = req.query;

    const result = await materialService.listMaterials({
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      search: search as string,
      category: category as string,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      sortBy: sortBy as 'name' | 'category' | 'createdAt' | 'updatedAt',
      sortOrder: sortOrder as 'asc' | 'desc',
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('List materials error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list materials',
    });
  }
});

/**
 * @route   GET /api/materials/categories
 * @desc    Get unique material categories
 * @access  Private
 */
router.get('/categories', authenticateToken, async (req: Request, res: Response) => {
  try {
    const categories = await materialService.getCategories();

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get categories',
    });
  }
});

/**
 * @route   GET /api/materials/:id
 * @desc    Get material by ID
 * @access  Private
 */
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { includeRelations = 'false' } = req.query;

    const material = await materialService.getMaterialById(id, includeRelations === 'true');

    if (!material) {
      return res.status(404).json({
        success: false,
        error: 'Material not found',
      });
    }

    res.status(200).json({
      success: true,
      data: material,
    });
  } catch (error) {
    console.error('Get material error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get material',
    });
  }
});

/**
 * @route   PUT /api/materials/:id
 * @desc    Update material
 * @access  Private (ADMIN, ESTIMATOR)
 */
router.put(
  '/:id',
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.ESTIMATOR),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, sku, category, unit, description, manufacturer, notes, isActive } = req.body;

      // Build update object
      const updateData: any = {};
      if (name !== undefined) updateData.name = name.trim();
      if (sku !== undefined) updateData.sku = sku.trim();
      if (category !== undefined) updateData.category = category.trim();
      if (unit !== undefined) updateData.unit = unit.trim();
      if (description !== undefined) updateData.description = description.trim();
      if (manufacturer !== undefined) updateData.manufacturer = manufacturer.trim();
      if (notes !== undefined) updateData.notes = notes.trim();
      if (isActive !== undefined) updateData.isActive = isActive;

      const material = await materialService.updateMaterial(id, updateData);

      res.status(200).json({
        success: true,
        data: material,
      });
    } catch (error) {
      console.error('Update material error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update material',
      });
    }
  }
);

/**
 * @route   POST /api/materials/:id/deactivate
 * @desc    Deactivate material
 * @access  Private (ADMIN)
 */
router.post(
  '/:id/deactivate',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const material = await materialService.deactivateMaterial(id);

      res.status(200).json({
        success: true,
        data: material,
      });
    } catch (error) {
      console.error('Deactivate material error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to deactivate material',
      });
    }
  }
);

/**
 * @route   POST /api/materials/:id/activate
 * @desc    Activate material
 * @access  Private (ADMIN)
 */
router.post(
  '/:id/activate',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const material = await materialService.activateMaterial(id);

      res.status(200).json({
        success: true,
        data: material,
      });
    } catch (error) {
      console.error('Activate material error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to activate material',
      });
    }
  }
);

/**
 * @route   DELETE /api/materials/:id
 * @desc    Delete material (hard delete - use with caution)
 * @access  Private (ADMIN only)
 */
router.delete(
  '/:id',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      await materialService.deleteMaterial(id);

      res.status(200).json({
        success: true,
        message: 'Material deleted successfully',
      });
    } catch (error) {
      console.error('Delete material error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete material',
      });
    }
  }
);

// ====== PRICING ROUTES ======

/**
 * @route   POST /api/materials/:materialId/pricing
 * @desc    Create pricing record for material
 * @access  Private (ADMIN, ESTIMATOR)
 */
router.post(
  '/:materialId/pricing',
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.ESTIMATOR),
  async (req: Request, res: Response) => {
    try {
      const { materialId } = req.params;
      const { supplierId, pricePerUnit, effectiveDate, source, notes } = req.body;

      // Validation
      if (!pricePerUnit || isNaN(parseFloat(pricePerUnit))) {
        return res.status(400).json({
          success: false,
          error: 'Valid price per unit is required',
        });
      }

      if (!effectiveDate) {
        return res.status(400).json({
          success: false,
          error: 'Effective date is required',
        });
      }

      const pricing = await materialService.createPricing({
        materialId,
        supplierId: supplierId?.trim(),
        pricePerUnit: parseFloat(pricePerUnit),
        effectiveDate: new Date(effectiveDate),
        source: source?.trim(),
        notes: notes?.trim(),
      });

      res.status(201).json({
        success: true,
        data: pricing,
      });
    } catch (error) {
      console.error('Create pricing error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create pricing',
      });
    }
  }
);

/**
 * @route   GET /api/materials/:materialId/pricing
 * @desc    Get pricing history for material
 * @access  Private
 */
router.get('/:materialId/pricing', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { materialId } = req.params;
    const { limit = '50' } = req.query;

    const pricing = await materialService.listMaterialPricing(materialId, parseInt(limit as string));

    res.status(200).json({
      success: true,
      data: pricing,
    });
  } catch (error) {
    console.error('List pricing error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list pricing',
    });
  }
});

/**
 * @route   GET /api/materials/:materialId/pricing/current
 * @desc    Get current price for material
 * @access  Private
 */
router.get('/:materialId/pricing/current', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { materialId } = req.params;
    const { supplierId } = req.query;

    const pricing = await materialService.getCurrentPrice(materialId, supplierId as string);

    if (!pricing) {
      return res.status(404).json({
        success: false,
        error: 'No pricing found for this material',
      });
    }

    res.status(200).json({
      success: true,
      data: pricing,
    });
  } catch (error) {
    console.error('Get current price error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get current price',
    });
  }
});

/**
 * @route   GET /api/materials/:materialId/pricing/stats
 * @desc    Get pricing statistics for material
 * @access  Private
 */
router.get('/:materialId/pricing/stats', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { materialId } = req.params;
    const { days = '365' } = req.query;

    const stats = await materialService.getPricingStats(materialId, parseInt(days as string));

    if (!stats) {
      return res.status(404).json({
        success: false,
        error: 'No pricing data available for this material',
      });
    }

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Get pricing stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get pricing statistics',
    });
  }
});

/**
 * @route   GET /api/materials/pricing/:pricingId
 * @desc    Get pricing record by ID
 * @access  Private
 */
router.get('/pricing/:pricingId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { pricingId } = req.params;

    const pricing = await materialService.getPricingById(pricingId);

    if (!pricing) {
      return res.status(404).json({
        success: false,
        error: 'Pricing record not found',
      });
    }

    res.status(200).json({
      success: true,
      data: pricing,
    });
  } catch (error) {
    console.error('Get pricing error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get pricing',
    });
  }
});

/**
 * @route   PUT /api/materials/pricing/:pricingId
 * @desc    Update pricing record
 * @access  Private (ADMIN, ESTIMATOR)
 */
router.put(
  '/pricing/:pricingId',
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.ESTIMATOR),
  async (req: Request, res: Response) => {
    try {
      const { pricingId } = req.params;
      const { supplierId, pricePerUnit, effectiveDate, source, notes } = req.body;

      // Build update object
      const updateData: any = {};
      if (supplierId !== undefined) updateData.supplierId = supplierId.trim();
      if (pricePerUnit !== undefined) updateData.pricePerUnit = parseFloat(pricePerUnit);
      if (effectiveDate !== undefined) updateData.effectiveDate = new Date(effectiveDate);
      if (source !== undefined) updateData.source = source.trim();
      if (notes !== undefined) updateData.notes = notes.trim();

      const pricing = await materialService.updatePricing(pricingId, updateData);

      res.status(200).json({
        success: true,
        data: pricing,
      });
    } catch (error) {
      console.error('Update pricing error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update pricing',
      });
    }
  }
);

/**
 * @route   DELETE /api/materials/pricing/:pricingId
 * @desc    Delete pricing record
 * @access  Private (ADMIN)
 */
router.delete(
  '/pricing/:pricingId',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  async (req: Request, res: Response) => {
    try {
      const { pricingId } = req.params;

      await materialService.deletePricing(pricingId);

      res.status(200).json({
        success: true,
        message: 'Pricing record deleted successfully',
      });
    } catch (error) {
      console.error('Delete pricing error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete pricing',
      });
    }
  }
);

export default router;
