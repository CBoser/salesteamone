import { Router } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import { CustomerController } from '../controllers/CustomerController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();
const customerController = new CustomerController(prisma);

/**
 * Customer API Routes
 * Base path: /api/customers
 *
 * Authentication: All routes require authentication
 * Authorization:
 *   - Read operations: All authenticated users
 *   - Write operations (POST, PUT, DELETE): ADMIN and ESTIMATOR only
 */

// ============================================================================
// Customer CRUD Routes
// ============================================================================

/**
 * @route   GET /api/customers
 * @desc    Get all customers with optional filtering and pagination
 * @access  Private (All authenticated users)
 * @query   page (number) - Page number (default: 1)
 * @query   limit (number) - Items per page (default: 50)
 * @query   search (string) - Search by name or notes
 * @query   customerType (string) - Filter by type (PRODUCTION, SEMI_CUSTOM, FULL_CUSTOM)
 * @query   isActive (boolean) - Filter by active status
 */
router.get('/', authenticateToken, customerController.getAllCustomers);

/**
 * @route   GET /api/customers/:id
 * @desc    Get customer by ID with all relations
 * @access  Private (All authenticated users)
 */
router.get('/:id', authenticateToken, customerController.getCustomer);

/**
 * @route   POST /api/customers
 * @desc    Create a new customer
 * @access  Private (ADMIN, ESTIMATOR)
 * @body    { customerName, customerType, pricingTier?, notes? }
 */
router.post(
  '/',
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.ESTIMATOR),
  customerController.createCustomer
);

/**
 * @route   PUT /api/customers/:id
 * @desc    Update an existing customer
 * @access  Private (ADMIN, ESTIMATOR)
 * @body    { customerName?, customerType?, pricingTier?, primaryContactId?, isActive?, notes? }
 */
router.put(
  '/:id',
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.ESTIMATOR),
  customerController.updateCustomer
);

/**
 * @route   DELETE /api/customers/:id
 * @desc    Delete a customer (soft delete by default)
 * @access  Private (ADMIN only)
 * @query   hard (boolean) - If true, permanently delete (default: false)
 */
router.delete(
  '/:id',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  customerController.deleteCustomer
);

// ============================================================================
// Customer Contact Routes
// ============================================================================

/**
 * @route   GET /api/customers/:id/contacts
 * @desc    Get all contacts for a customer
 * @access  Private (All authenticated users)
 */
router.get('/:id/contacts', authenticateToken, customerController.getCustomerContacts);

/**
 * @route   POST /api/customers/:id/contacts
 * @desc    Add a contact to a customer
 * @access  Private (ADMIN, ESTIMATOR)
 * @body    { contactName, role?, email?, phone?, receivesNotifications?, isPrimary? }
 */
router.post(
  '/:id/contacts',
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.ESTIMATOR),
  customerController.addCustomerContact
);

/**
 * @route   PUT /api/customers/:id/contacts/:contactId
 * @desc    Update a customer contact
 * @access  Private (ADMIN, ESTIMATOR)
 * @body    { contactName?, role?, email?, phone?, receivesNotifications?, isPrimary? }
 */
router.put(
  '/:id/contacts/:contactId',
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.ESTIMATOR),
  customerController.updateCustomerContact
);

/**
 * @route   DELETE /api/customers/:id/contacts/:contactId
 * @desc    Delete a customer contact
 * @access  Private (ADMIN, ESTIMATOR)
 */
router.delete(
  '/:id/contacts/:contactId',
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.ESTIMATOR),
  customerController.deleteCustomerContact
);

// ============================================================================
// Customer Pricing Tier Routes
// ============================================================================

/**
 * @route   GET /api/customers/:id/pricing-tiers
 * @desc    Get all pricing tiers for a customer
 * @access  Private (All authenticated users)
 */
router.get('/:id/pricing-tiers', authenticateToken, customerController.getCustomerPricingTiers);

/**
 * @route   POST /api/customers/:id/pricing-tiers
 * @desc    Add a pricing tier to a customer
 * @access  Private (ADMIN, ESTIMATOR)
 * @body    { tierName, discountPercentage, effectiveDate, expirationDate? }
 */
router.post(
  '/:id/pricing-tiers',
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.ESTIMATOR),
  customerController.addCustomerPricingTier
);

/**
 * @route   GET /api/customers/:id/current-pricing
 * @desc    Get the current active pricing tier for a customer
 * @access  Private (All authenticated users)
 */
router.get('/:id/current-pricing', authenticateToken, customerController.getCurrentPricingTier);

/**
 * @route   PUT /api/customers/:id/pricing-tiers/:tierId
 * @desc    Update a pricing tier
 * @access  Private (ADMIN, ESTIMATOR)
 * @body    { tierName?, discountPercentage?, effectiveDate?, expirationDate? }
 */
router.put(
  '/:id/pricing-tiers/:tierId',
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.ESTIMATOR),
  customerController.updateCustomerPricingTier
);

/**
 * @route   DELETE /api/customers/:id/pricing-tiers/:tierId
 * @desc    Delete a pricing tier
 * @access  Private (ADMIN, ESTIMATOR)
 */
router.delete(
  '/:id/pricing-tiers/:tierId',
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.ESTIMATOR),
  customerController.deleteCustomerPricingTier
);

// ============================================================================
// Customer External ID Routes
// ============================================================================

/**
 * @route   GET /api/customers/:id/external-ids
 * @desc    Get all external IDs for a customer
 * @access  Private (All authenticated users)
 */
router.get('/:id/external-ids', authenticateToken, customerController.getCustomerExternalIds);

/**
 * @route   POST /api/customers/:id/external-ids
 * @desc    Map a customer to an external system
 * @access  Private (ADMIN, ESTIMATOR)
 * @body    { externalSystem, externalCustomerId, externalCustomerName?, isPrimary? }
 */
router.post(
  '/:id/external-ids',
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.ESTIMATOR),
  customerController.addCustomerExternalId
);

/**
 * @route   PUT /api/customers/:id/external-ids/:externalIdId
 * @desc    Update an external ID mapping
 * @access  Private (ADMIN, ESTIMATOR)
 * @body    { externalCustomerId?, externalCustomerName?, isPrimary? }
 */
router.put(
  '/:id/external-ids/:externalIdId',
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.ESTIMATOR),
  customerController.updateCustomerExternalId
);

/**
 * @route   DELETE /api/customers/:id/external-ids/:externalIdId
 * @desc    Delete an external ID mapping
 * @access  Private (ADMIN, ESTIMATOR)
 */
router.delete(
  '/:id/external-ids/:externalIdId',
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.ESTIMATOR),
  customerController.deleteCustomerExternalId
);

/**
 * @route   GET /api/customers/external/:system/:externalId
 * @desc    Find customer by external system ID
 * @access  Private (All authenticated users)
 * @note    This route must be defined LAST to avoid conflicts with /:id routes
 */
router.get(
  '/external/:system/:externalId',
  authenticateToken,
  customerController.findCustomerByExternalId
);

export default router;
