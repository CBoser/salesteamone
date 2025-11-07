import { Router, Request, Response } from 'express';
import { customerService } from '../services/customer';
import { authenticateToken, requireRole } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

/**
 * @route   POST /api/customers
 * @desc    Create a new customer
 * @access  Private (ADMIN, ESTIMATOR)
 */
router.post(
  '/',
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.ESTIMATOR),
  async (req: Request, res: Response) => {
    try {
      const { name, contactEmail, contactPhone, address, city, state, zipCode, notes, isActive } =
        req.body;

      // Validation
      if (!name || name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Customer name is required',
        });
      }

      const customer = await customerService.createCustomer({
        name: name.trim(),
        contactEmail: contactEmail?.trim(),
        contactPhone: contactPhone?.trim(),
        address: address?.trim(),
        city: city?.trim(),
        state: state?.trim(),
        zipCode: zipCode?.trim(),
        notes: notes?.trim(),
        isActive,
      });

      res.status(201).json({
        success: true,
        data: customer,
      });
    } catch (error) {
      console.error('Create customer error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create customer',
      });
    }
  }
);

/**
 * @route   GET /api/customers
 * @desc    List customers with filtering and pagination
 * @access  Private
 */
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '50',
      search,
      isActive,
      sortBy = 'name',
      sortOrder = 'asc',
    } = req.query;

    const result = await customerService.listCustomers({
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      search: search as string,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      sortBy: sortBy as 'name' | 'createdAt' | 'updatedAt',
      sortOrder: sortOrder as 'asc' | 'desc',
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('List customers error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list customers',
    });
  }
});

/**
 * @route   GET /api/customers/:id
 * @desc    Get customer by ID
 * @access  Private
 */
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { includeRelations = 'false' } = req.query;

    const customer = await customerService.getCustomerById(
      id,
      includeRelations === 'true'
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found',
      });
    }

    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get customer',
    });
  }
});

/**
 * @route   GET /api/customers/:id/stats
 * @desc    Get customer statistics
 * @access  Private
 */
router.get('/:id/stats', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const stats = await customerService.getCustomerStats(id);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Get customer stats error:', error);
    res.status(404).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get customer statistics',
    });
  }
});

/**
 * @route   PUT /api/customers/:id
 * @desc    Update customer
 * @access  Private (ADMIN, ESTIMATOR)
 */
router.put(
  '/:id',
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.ESTIMATOR),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, contactEmail, contactPhone, address, city, state, zipCode, notes, isActive } =
        req.body;

      // Build update object (only include provided fields)
      const updateData: any = {};
      if (name !== undefined) updateData.name = name.trim();
      if (contactEmail !== undefined) updateData.contactEmail = contactEmail.trim();
      if (contactPhone !== undefined) updateData.contactPhone = contactPhone.trim();
      if (address !== undefined) updateData.address = address.trim();
      if (city !== undefined) updateData.city = city.trim();
      if (state !== undefined) updateData.state = state.trim();
      if (zipCode !== undefined) updateData.zipCode = zipCode.trim();
      if (notes !== undefined) updateData.notes = notes.trim();
      if (isActive !== undefined) updateData.isActive = isActive;

      const customer = await customerService.updateCustomer(id, updateData);

      res.status(200).json({
        success: true,
        data: customer,
      });
    } catch (error) {
      console.error('Update customer error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update customer',
      });
    }
  }
);

/**
 * @route   POST /api/customers/:id/deactivate
 * @desc    Deactivate customer
 * @access  Private (ADMIN)
 */
router.post(
  '/:id/deactivate',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const customer = await customerService.deactivateCustomer(id);

      res.status(200).json({
        success: true,
        data: customer,
      });
    } catch (error) {
      console.error('Deactivate customer error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to deactivate customer',
      });
    }
  }
);

/**
 * @route   POST /api/customers/:id/activate
 * @desc    Activate customer
 * @access  Private (ADMIN)
 */
router.post(
  '/:id/activate',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const customer = await customerService.activateCustomer(id);

      res.status(200).json({
        success: true,
        data: customer,
      });
    } catch (error) {
      console.error('Activate customer error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to activate customer',
      });
    }
  }
);

/**
 * @route   DELETE /api/customers/:id
 * @desc    Delete customer (hard delete - use with caution)
 * @access  Private (ADMIN only)
 */
router.delete(
  '/:id',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      await customerService.deleteCustomer(id);

      res.status(200).json({
        success: true,
        message: 'Customer deleted successfully',
      });
    } catch (error) {
      console.error('Delete customer error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete customer',
      });
    }
  }
);

export default router;
