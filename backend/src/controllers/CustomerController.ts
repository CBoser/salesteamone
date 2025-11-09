import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { CustomerService } from '../services/CustomerService';
import { asyncHandler } from '../middleware/errorHandler';

/**
 * Customer Controller
 * Handles HTTP request/response logic for Customer operations
 */
export class CustomerController {
  private customerService: CustomerService;

  constructor(prisma: PrismaClient) {
    this.customerService = new CustomerService(prisma);
  }

  // ============================================================================
  // Customer CRUD Operations
  // ============================================================================

  /**
   * GET /api/customers
   * Get all customers with optional filtering and pagination
   */
  getAllCustomers = asyncHandler(async (req: Request, res: Response) => {
    const query: any = {};

    if (req.query.page) {
      query.page = parseInt(req.query.page as string);
    }
    if (req.query.limit) {
      query.limit = parseInt(req.query.limit as string);
    }
    if (req.query.search) {
      query.search = req.query.search as string;
    }
    if (req.query.customerType) {
      query.customerType = req.query.customerType;
    }
    if (req.query.isActive !== undefined) {
      query.isActive = req.query.isActive === 'true';
    }

    const result = await this.customerService.getAllCustomers(query);

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  });

  /**
   * GET /api/customers/:id
   * Get customer by ID with all relations
   */
  getCustomer = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const customer = await this.customerService.getCustomerById(id);

    res.status(200).json({
      success: true,
      data: customer,
    });
  });

  /**
   * POST /api/customers
   * Create a new customer
   */
  createCustomer = asyncHandler(async (req: Request, res: Response) => {
    const customerData = req.body;

    const customer = await this.customerService.createCustomer(customerData);

    res.status(201).json({
      success: true,
      data: customer,
      message: 'Customer created successfully',
    });
  });

  /**
   * PUT /api/customers/:id
   * Update an existing customer
   */
  updateCustomer = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;

    const customer = await this.customerService.updateCustomer(id, updateData);

    res.status(200).json({
      success: true,
      data: customer,
      message: 'Customer updated successfully',
    });
  });

  /**
   * DELETE /api/customers/:id
   * Delete a customer (soft delete by default)
   */
  deleteCustomer = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const hardDelete = req.query.hard === 'true';

    await this.customerService.deleteCustomer(id, hardDelete);

    res.status(200).json({
      success: true,
      message: `Customer ${hardDelete ? 'permanently deleted' : 'deactivated'} successfully`,
    });
  });

  // ============================================================================
  // Customer Contact Operations
  // ============================================================================

  /**
   * GET /api/customers/:id/contacts
   * Get all contacts for a customer
   */
  getCustomerContacts = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const customer = await this.customerService.getCustomerById(id);

    res.status(200).json({
      success: true,
      data: customer.contacts || [],
    });
  });

  /**
   * POST /api/customers/:id/contacts
   * Add a contact to a customer
   */
  addCustomerContact = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const contactData = {
      ...req.body,
      customerId: id,
    };

    const contact = await this.customerService.addContact(contactData);

    res.status(201).json({
      success: true,
      data: contact,
      message: 'Contact added successfully',
    });
  });

  /**
   * PUT /api/customers/:id/contacts/:contactId
   * Update a customer contact
   */
  updateCustomerContact = asyncHandler(async (req: Request, res: Response) => {
    const { contactId } = req.params;
    const updateData = req.body;

    const contact = await this.customerService.updateContact(contactId, updateData);

    res.status(200).json({
      success: true,
      data: contact,
      message: 'Contact updated successfully',
    });
  });

  /**
   * DELETE /api/customers/:id/contacts/:contactId
   * Delete a customer contact
   */
  deleteCustomerContact = asyncHandler(async (req: Request, res: Response) => {
    const { contactId } = req.params;

    await this.customerService.deleteContact(contactId);

    res.status(200).json({
      success: true,
      message: 'Contact deleted successfully',
    });
  });

  // ============================================================================
  // Customer Pricing Tier Operations
  // ============================================================================

  /**
   * GET /api/customers/:id/pricing-tiers
   * Get all pricing tiers for a customer
   */
  getCustomerPricingTiers = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const customer = await this.customerService.getCustomerById(id);

    res.status(200).json({
      success: true,
      data: customer.pricingTiers || [],
    });
  });

  /**
   * POST /api/customers/:id/pricing-tiers
   * Add a pricing tier to a customer
   */
  addCustomerPricingTier = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const tierData = {
      ...req.body,
      customerId: id,
      effectiveDate: new Date(req.body.effectiveDate),
      expirationDate: req.body.expirationDate ? new Date(req.body.expirationDate) : undefined,
    };

    const tier = await this.customerService.addPricingTier(tierData);

    res.status(201).json({
      success: true,
      data: tier,
      message: 'Pricing tier added successfully',
    });
  });

  /**
   * GET /api/customers/:id/current-pricing
   * Get the current active pricing tier for a customer
   */
  getCurrentPricingTier = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const tier = await this.customerService.getCurrentPricingTier(id);

    res.status(200).json({
      success: true,
      data: tier,
    });
  });

  /**
   * PUT /api/customers/:id/pricing-tiers/:tierId
   * Update a pricing tier
   */
  updateCustomerPricingTier = asyncHandler(async (req: Request, res: Response) => {
    const { tierId } = req.params;
    const updateData = {
      ...req.body,
      effectiveDate: req.body.effectiveDate ? new Date(req.body.effectiveDate) : undefined,
      expirationDate: req.body.expirationDate ? new Date(req.body.expirationDate) : undefined,
    };

    const tier = await this.customerService.updatePricingTier(tierId, updateData);

    res.status(200).json({
      success: true,
      data: tier,
      message: 'Pricing tier updated successfully',
    });
  });

  /**
   * DELETE /api/customers/:id/pricing-tiers/:tierId
   * Delete a pricing tier
   */
  deleteCustomerPricingTier = asyncHandler(async (req: Request, res: Response) => {
    const { tierId } = req.params;

    await this.customerService.deletePricingTier(tierId);

    res.status(200).json({
      success: true,
      message: 'Pricing tier deleted successfully',
    });
  });

  // ============================================================================
  // Customer External ID Operations
  // ============================================================================

  /**
   * GET /api/customers/:id/external-ids
   * Get all external IDs for a customer
   */
  getCustomerExternalIds = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const customer = await this.customerService.getCustomerById(id);

    res.status(200).json({
      success: true,
      data: customer.externalIds || [],
    });
  });

  /**
   * POST /api/customers/:id/external-ids
   * Map a customer to an external system
   */
  addCustomerExternalId = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const externalIdData = {
      ...req.body,
      customerId: id,
    };

    const externalId = await this.customerService.mapExternalId(externalIdData);

    res.status(201).json({
      success: true,
      data: externalId,
      message: 'External ID mapped successfully',
    });
  });

  /**
   * PUT /api/customers/:id/external-ids/:externalIdId
   * Update an external ID mapping
   */
  updateCustomerExternalId = asyncHandler(async (req: Request, res: Response) => {
    const { externalIdId } = req.params;
    const updateData = req.body;

    const externalId = await this.customerService.updateExternalId(externalIdId, updateData);

    res.status(200).json({
      success: true,
      data: externalId,
      message: 'External ID updated successfully',
    });
  });

  /**
   * DELETE /api/customers/:id/external-ids/:externalIdId
   * Delete an external ID mapping
   */
  deleteCustomerExternalId = asyncHandler(async (req: Request, res: Response) => {
    const { externalIdId } = req.params;

    await this.customerService.deleteExternalId(externalIdId);

    res.status(200).json({
      success: true,
      message: 'External ID deleted successfully',
    });
  });

  /**
   * GET /api/customers/external/:system/:externalId
   * Find customer by external system ID
   */
  findCustomerByExternalId = asyncHandler(async (req: Request, res: Response) => {
    const { system, externalId } = req.params;

    const customer = await this.customerService.findByExternalId(system, externalId);

    res.status(200).json({
      success: true,
      data: customer,
    });
  });
}
