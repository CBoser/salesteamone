import { PrismaClient, CustomerContact, CustomerPricingTier, CustomerExternalId } from '@prisma/client';
import {
  ICustomerRepository,
  CustomerRepository,
  CustomerWithRelations,
  CustomerListResult,
} from '../repositories/CustomerRepository';
import {
  CustomerNotFoundError,
  CustomerHasDependenciesError,
  InvalidCustomerDataError,
  CustomerContactNotFoundError,
  CustomerPricingTierNotFoundError,
  CustomerExternalIdNotFoundError,
  DuplicateExternalIdError,
} from '../errors/customer';
import {
  createCustomerSchema,
  updateCustomerSchema,
  createCustomerContactSchema,
  updateCustomerContactSchema,
  createCustomerPricingTierSchema,
  updateCustomerPricingTierSchema,
  createCustomerExternalIdSchema,
  updateCustomerExternalIdSchema,
  listCustomersQuerySchema,
  CreateCustomerInput,
  UpdateCustomerInput,
  CreateCustomerContactInput,
  UpdateCustomerContactInput,
  CreateCustomerPricingTierInput,
  UpdateCustomerPricingTierInput,
  CreateCustomerExternalIdInput,
  UpdateCustomerExternalIdInput,
  ListCustomersQuery,
} from '../validators/customer';

/**
 * Customer Service
 * Handles business logic for Customer operations
 * Uses repository pattern for database access
 */
export class CustomerService {
  private customerRepository: ICustomerRepository;
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient, customerRepository?: ICustomerRepository) {
    this.prisma = prisma;
    // Allow dependency injection for testing
    this.customerRepository = customerRepository || new CustomerRepository(prisma);
  }

  // ============================================================================
  // Customer CRUD Operations
  // ============================================================================

  /**
   * Get all customers with optional filtering and pagination
   */
  async getAllCustomers(query: ListCustomersQuery = {}): Promise<CustomerListResult> {
    // Validate query parameters
    const validatedQuery = listCustomersQuerySchema.parse(query);

    const { page, limit, search, customerType, isActive } = validatedQuery;

    const filters = {
      search,
      customerType,
      isActive,
    };

    const pagination = { page, limit };

    return this.customerRepository.findAll(filters, pagination);
  }

  /**
   * Get customer by ID with all related data
   */
  async getCustomerById(id: string): Promise<CustomerWithRelations> {
    const customer = await this.customerRepository.findById(id, true);

    if (!customer) {
      throw new CustomerNotFoundError(id);
    }

    return customer;
  }

  /**
   * Create a new customer
   */
  async createCustomer(data: CreateCustomerInput): Promise<CustomerWithRelations> {
    // Validate input
    const validatedData = createCustomerSchema.parse(data);

    try {
      const customer = await this.customerRepository.create(validatedData);

      // Log audit trail
      console.log(`[AUDIT] Customer created: ${customer.id} - ${customer.customerName}`);

      // Return customer with relations
      return await this.getCustomerById(customer.id);
    } catch (error) {
      if (error instanceof Error) {
        throw new InvalidCustomerDataError(`Failed to create customer: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Update an existing customer
   */
  async updateCustomer(id: string, data: UpdateCustomerInput): Promise<CustomerWithRelations> {
    // Validate input
    const validatedData = updateCustomerSchema.parse(data);

    // Verify customer exists
    await this.getCustomerById(id);

    try {
      await this.customerRepository.update(id, validatedData);

      // Log audit trail
      console.log(`[AUDIT] Customer updated: ${id}`);

      // Return updated customer with relations
      return await this.getCustomerById(id);
    } catch (error) {
      if (error instanceof CustomerNotFoundError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new InvalidCustomerDataError(`Failed to update customer: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Delete a customer (soft delete by setting isActive = false)
   * Hard delete only if no dependencies exist
   */
  async deleteCustomer(id: string, hardDelete = false): Promise<void> {
    // Verify customer exists
    const customer = await this.getCustomerById(id);

    // Check for dependencies (jobs)
    const jobCount = await this.prisma.job.count({
      where: { customerId: id },
    });

    if (jobCount > 0) {
      throw new CustomerHasDependenciesError(id, [`${jobCount} job(s)`]);
    }

    if (hardDelete) {
      // Hard delete - cascades to contacts, pricing tiers, external IDs
      await this.customerRepository.delete(id);
      console.log(`[AUDIT] Customer hard deleted: ${id} - ${customer.customerName}`);
    } else {
      // Soft delete - just mark as inactive
      await this.customerRepository.update(id, { isActive: false });
      console.log(`[AUDIT] Customer soft deleted: ${id} - ${customer.customerName}`);
    }
  }

  // ============================================================================
  // Customer Contact Operations
  // ============================================================================

  /**
   * Add a contact to a customer
   */
  async addContact(data: CreateCustomerContactInput): Promise<CustomerContact> {
    // Validate input
    const validatedData = createCustomerContactSchema.parse(data);

    // Verify customer exists
    await this.getCustomerById(validatedData.customerId);

    // If this is primary contact, unset other primary contacts
    if (validatedData.isPrimary) {
      await this.prisma.customerContact.updateMany({
        where: {
          customerId: validatedData.customerId,
          isPrimary: true,
        },
        data: { isPrimary: false },
      });
    }

    const contact = await this.prisma.customerContact.create({
      data: validatedData,
    });

    // If this is the first contact, set as primary
    const contactCount = await this.prisma.customerContact.count({
      where: { customerId: validatedData.customerId },
    });

    if (contactCount === 1) {
      await this.prisma.customerContact.update({
        where: { id: contact.id },
        data: { isPrimary: true },
      });

      // Update customer's primaryContactId
      await this.customerRepository.update(validatedData.customerId, {
        primaryContactId: contact.id,
      });
    }

    console.log(`[AUDIT] Contact added: ${contact.id} for customer ${validatedData.customerId}`);
    return contact;
  }

  /**
   * Update a customer contact
   */
  async updateContact(
    contactId: string,
    data: UpdateCustomerContactInput
  ): Promise<CustomerContact> {
    // Validate input
    const validatedData = updateCustomerContactSchema.parse(data);

    // Verify contact exists
    const existingContact = await this.prisma.customerContact.findUnique({
      where: { id: contactId },
    });

    if (!existingContact) {
      throw new CustomerContactNotFoundError(contactId);
    }

    // If setting as primary, unset other primary contacts
    if (validatedData.isPrimary) {
      await this.prisma.customerContact.updateMany({
        where: {
          customerId: existingContact.customerId,
          isPrimary: true,
          id: { not: contactId },
        },
        data: { isPrimary: false },
      });
    }

    const contact = await this.prisma.customerContact.update({
      where: { id: contactId },
      data: validatedData,
    });

    console.log(`[AUDIT] Contact updated: ${contactId}`);
    return contact;
  }

  /**
   * Delete a customer contact
   */
  async deleteContact(contactId: string): Promise<void> {
    // Verify contact exists
    const contact = await this.prisma.customerContact.findUnique({
      where: { id: contactId },
    });

    if (!contact) {
      throw new CustomerContactNotFoundError(contactId);
    }

    await this.prisma.customerContact.delete({
      where: { id: contactId },
    });

    // If this was the primary contact, unset customer's primaryContactId
    if (contact.isPrimary) {
      await this.customerRepository.update(contact.customerId, {
        primaryContactId: null,
      });

      // Set another contact as primary if available
      const otherContact = await this.prisma.customerContact.findFirst({
        where: { customerId: contact.customerId },
      });

      if (otherContact) {
        await this.prisma.customerContact.update({
          where: { id: otherContact.id },
          data: { isPrimary: true },
        });

        await this.customerRepository.update(contact.customerId, {
          primaryContactId: otherContact.id,
        });
      }
    }

    console.log(`[AUDIT] Contact deleted: ${contactId}`);
  }

  // ============================================================================
  // Customer Pricing Tier Operations
  // ============================================================================

  /**
   * Add a pricing tier to a customer
   */
  async addPricingTier(data: CreateCustomerPricingTierInput): Promise<CustomerPricingTier> {
    // Validate input
    const validatedData = createCustomerPricingTierSchema.parse(data);

    // Verify customer exists
    await this.getCustomerById(validatedData.customerId);

    const pricingTier = await this.prisma.customerPricingTier.create({
      data: validatedData,
    });

    console.log(
      `[AUDIT] Pricing tier added: ${pricingTier.id} for customer ${validatedData.customerId}`
    );
    return pricingTier;
  }

  /**
   * Get the current active pricing tier for a customer
   * Returns the tier that is effective today
   */
  async getCurrentPricingTier(customerId: string): Promise<CustomerPricingTier | null> {
    // Verify customer exists
    await this.getCustomerById(customerId);

    const now = new Date();

    const currentTier = await this.prisma.customerPricingTier.findFirst({
      where: {
        customerId,
        effectiveDate: { lte: now },
        OR: [{ expirationDate: null }, { expirationDate: { gte: now } }],
      },
      orderBy: { effectiveDate: 'desc' },
    });

    return currentTier;
  }

  /**
   * Update a pricing tier
   */
  async updatePricingTier(
    tierId: string,
    data: UpdateCustomerPricingTierInput
  ): Promise<CustomerPricingTier> {
    // Validate input
    const validatedData = updateCustomerPricingTierSchema.parse(data);

    // Verify tier exists
    const existingTier = await this.prisma.customerPricingTier.findUnique({
      where: { id: tierId },
    });

    if (!existingTier) {
      throw new CustomerPricingTierNotFoundError(tierId);
    }

    const tier = await this.prisma.customerPricingTier.update({
      where: { id: tierId },
      data: validatedData,
    });

    console.log(`[AUDIT] Pricing tier updated: ${tierId}`);
    return tier;
  }

  /**
   * Delete a pricing tier
   */
  async deletePricingTier(tierId: string): Promise<void> {
    // Verify tier exists
    const tier = await this.prisma.customerPricingTier.findUnique({
      where: { id: tierId },
    });

    if (!tier) {
      throw new CustomerPricingTierNotFoundError(tierId);
    }

    await this.prisma.customerPricingTier.delete({
      where: { id: tierId },
    });

    console.log(`[AUDIT] Pricing tier deleted: ${tierId}`);
  }

  // ============================================================================
  // External ID Mapping Operations
  // ============================================================================

  /**
   * Map a customer to an external system ID
   */
  async mapExternalId(data: CreateCustomerExternalIdInput): Promise<CustomerExternalId> {
    // Validate input
    const validatedData = createCustomerExternalIdSchema.parse(data);

    // Verify customer exists
    await this.getCustomerById(validatedData.customerId);

    // Check if mapping already exists
    const existing = await this.prisma.customerExternalId.findUnique({
      where: {
        customerId_externalSystem: {
          customerId: validatedData.customerId,
          externalSystem: validatedData.externalSystem,
        },
      },
    });

    if (existing) {
      throw new DuplicateExternalIdError(
        validatedData.externalSystem,
        validatedData.externalCustomerId
      );
    }

    // If setting as primary, unset other primary external IDs for this system
    if (validatedData.isPrimary) {
      await this.prisma.customerExternalId.updateMany({
        where: {
          customerId: validatedData.customerId,
          externalSystem: validatedData.externalSystem,
          isPrimary: true,
        },
        data: { isPrimary: false },
      });
    }

    const externalId = await this.prisma.customerExternalId.create({
      data: validatedData,
    });

    console.log(
      `[AUDIT] External ID mapped: ${externalId.id} for customer ${validatedData.customerId} in system ${validatedData.externalSystem}`
    );
    return externalId;
  }

  /**
   * Update an external ID mapping
   */
  async updateExternalId(
    externalIdId: string,
    data: UpdateCustomerExternalIdInput
  ): Promise<CustomerExternalId> {
    // Validate input
    const validatedData = updateCustomerExternalIdSchema.parse(data);

    // Verify external ID exists
    const existing = await this.prisma.customerExternalId.findUnique({
      where: { id: externalIdId },
    });

    if (!existing) {
      throw new CustomerExternalIdNotFoundError(externalIdId);
    }

    // If setting as primary, unset other primary external IDs for this system
    if (validatedData.isPrimary) {
      await this.prisma.customerExternalId.updateMany({
        where: {
          customerId: existing.customerId,
          externalSystem: existing.externalSystem,
          isPrimary: true,
          id: { not: externalIdId },
        },
        data: { isPrimary: false },
      });
    }

    const externalId = await this.prisma.customerExternalId.update({
      where: { id: externalIdId },
      data: validatedData,
    });

    console.log(`[AUDIT] External ID updated: ${externalIdId}`);
    return externalId;
  }

  /**
   * Delete an external ID mapping
   */
  async deleteExternalId(externalIdId: string): Promise<void> {
    // Verify external ID exists
    const externalId = await this.prisma.customerExternalId.findUnique({
      where: { id: externalIdId },
    });

    if (!externalId) {
      throw new CustomerExternalIdNotFoundError(externalIdId);
    }

    await this.prisma.customerExternalId.delete({
      where: { id: externalIdId },
    });

    console.log(`[AUDIT] External ID deleted: ${externalIdId}`);
  }

  /**
   * Find customer by external system ID
   */
  async findByExternalId(system: string, externalId: string): Promise<CustomerWithRelations> {
    const customer = await this.customerRepository.findByExternalId(system, externalId);

    if (!customer) {
      throw new CustomerNotFoundError(`${system}:${externalId}`);
    }

    // Return with relations
    return await this.getCustomerById(customer.id);
  }
}
