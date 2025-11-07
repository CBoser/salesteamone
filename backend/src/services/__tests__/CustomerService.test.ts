/**
 * Customer Service Tests
 *
 * These tests verify the business logic layer for Customer operations.
 * Run with: npm test (after installing jest)
 *
 * Test Coverage:
 * - Customer CRUD operations
 * - Contact management
 * - Pricing tier management
 * - External ID mapping
 * - Input validation
 * - Error handling
 */

import { PrismaClient, CustomerType } from '@prisma/client';
import { CustomerService } from '../CustomerService';
import { CustomerRepository } from '../../repositories/CustomerRepository';
import {
  CustomerNotFoundError,
  CustomerHasDependenciesError,
  InvalidCustomerDataError,
  DuplicateExternalIdError,
} from '../../errors/customer';

// Mock Prisma Client
const mockPrisma = {
  customer: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  customerContact: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  customerPricingTier: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  customerExternalId: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
  },
  job: {
    count: jest.fn(),
  },
} as unknown as PrismaClient;

describe('CustomerService', () => {
  let service: CustomerService;
  let repository: CustomerRepository;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create fresh instances
    repository = new CustomerRepository(mockPrisma);
    service = new CustomerService(mockPrisma, repository);
  });

  // ============================================================================
  // Customer CRUD Tests
  // ============================================================================

  describe('getAllCustomers', () => {
    it('should return paginated list of customers', async () => {
      const mockCustomers = [
        {
          id: '1',
          customerName: 'Richmond American',
          customerType: CustomerType.PRODUCTION,
          isActive: true,
        },
        {
          id: '2',
          customerName: 'Holt Homes',
          customerType: CustomerType.PRODUCTION,
          isActive: true,
        },
      ];

      mockPrisma.customer.findMany.mockResolvedValue(mockCustomers);
      mockPrisma.customer.count.mockResolvedValue(2);

      const result = await service.getAllCustomers({ page: 1, limit: 50 });

      expect(result.data).toEqual(mockCustomers);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 50,
        total: 2,
        totalPages: 1,
      });
    });

    it('should filter by customer type', async () => {
      mockPrisma.customer.findMany.mockResolvedValue([]);
      mockPrisma.customer.count.mockResolvedValue(0);

      await service.getAllCustomers({
        customerType: CustomerType.PRODUCTION,
      });

      expect(mockPrisma.customer.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            customerType: CustomerType.PRODUCTION,
          }),
        })
      );
    });

    it('should search by customer name', async () => {
      mockPrisma.customer.findMany.mockResolvedValue([]);
      mockPrisma.customer.count.mockResolvedValue(0);

      await service.getAllCustomers({ search: 'Richmond' });

      expect(mockPrisma.customer.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({
                customerName: expect.objectContaining({ contains: 'Richmond' }),
              }),
            ]),
          }),
        })
      );
    });
  });

  describe('getCustomerById', () => {
    it('should return customer with relations', async () => {
      const mockCustomer = {
        id: '1',
        customerName: 'Richmond American',
        customerType: CustomerType.PRODUCTION,
        isActive: true,
        contacts: [],
        pricingTiers: [],
        externalIds: [],
      };

      mockPrisma.customer.findUnique.mockResolvedValue(mockCustomer);

      const result = await service.getCustomerById('1');

      expect(result).toEqual(mockCustomer);
      expect(mockPrisma.customer.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: '1' },
          include: expect.any(Object),
        })
      );
    });

    it('should throw CustomerNotFoundError if customer does not exist', async () => {
      mockPrisma.customer.findUnique.mockResolvedValue(null);

      await expect(service.getCustomerById('nonexistent')).rejects.toThrow(
        CustomerNotFoundError
      );
    });
  });

  describe('createCustomer', () => {
    it('should create a new customer', async () => {
      const input = {
        customerName: 'Test Customer',
        customerType: CustomerType.PRODUCTION,
        pricingTier: 'TIER_1',
      };

      const mockCreatedCustomer = {
        id: '1',
        ...input,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.customer.create.mockResolvedValue(mockCreatedCustomer);
      mockPrisma.customer.findUnique.mockResolvedValue({
        ...mockCreatedCustomer,
        contacts: [],
        pricingTiers: [],
        externalIds: [],
      });

      const result = await service.createCustomer(input);

      expect(result.customerName).toBe(input.customerName);
      expect(mockPrisma.customer.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            customerName: input.customerName,
            customerType: input.customerType,
          }),
        })
      );
    });

    it('should validate input data', async () => {
      const invalidInput = {
        customerName: '', // Empty name should fail
        customerType: CustomerType.PRODUCTION,
      };

      await expect(service.createCustomer(invalidInput)).rejects.toThrow();
    });
  });

  describe('updateCustomer', () => {
    it('should update existing customer', async () => {
      const mockCustomer = {
        id: '1',
        customerName: 'Old Name',
        customerType: CustomerType.PRODUCTION,
        isActive: true,
        contacts: [],
        pricingTiers: [],
        externalIds: [],
      };

      mockPrisma.customer.findUnique.mockResolvedValue(mockCustomer);
      mockPrisma.customer.update.mockResolvedValue({
        ...mockCustomer,
        customerName: 'New Name',
      });

      const result = await service.updateCustomer('1', {
        customerName: 'New Name',
      });

      expect(result.customerName).toBe('New Name');
    });

    it('should throw CustomerNotFoundError if customer does not exist', async () => {
      mockPrisma.customer.findUnique.mockResolvedValue(null);

      await expect(
        service.updateCustomer('nonexistent', { customerName: 'New Name' })
      ).rejects.toThrow(CustomerNotFoundError);
    });
  });

  describe('deleteCustomer', () => {
    it('should soft delete customer by default', async () => {
      const mockCustomer = {
        id: '1',
        customerName: 'Test Customer',
        customerType: CustomerType.PRODUCTION,
        isActive: true,
        contacts: [],
        pricingTiers: [],
        externalIds: [],
      };

      mockPrisma.customer.findUnique.mockResolvedValue(mockCustomer);
      mockPrisma.job.count.mockResolvedValue(0);
      mockPrisma.customer.update.mockResolvedValue({
        ...mockCustomer,
        isActive: false,
      });

      await service.deleteCustomer('1');

      expect(mockPrisma.customer.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: '1' },
          data: { isActive: false },
        })
      );
    });

    it('should throw error if customer has jobs', async () => {
      const mockCustomer = {
        id: '1',
        customerName: 'Test Customer',
        customerType: CustomerType.PRODUCTION,
        isActive: true,
        contacts: [],
        pricingTiers: [],
        externalIds: [],
      };

      mockPrisma.customer.findUnique.mockResolvedValue(mockCustomer);
      mockPrisma.job.count.mockResolvedValue(5);

      await expect(service.deleteCustomer('1')).rejects.toThrow(
        CustomerHasDependenciesError
      );
    });

    it('should hard delete customer if specified and no dependencies', async () => {
      const mockCustomer = {
        id: '1',
        customerName: 'Test Customer',
        customerType: CustomerType.PRODUCTION,
        isActive: true,
        contacts: [],
        pricingTiers: [],
        externalIds: [],
      };

      mockPrisma.customer.findUnique.mockResolvedValue(mockCustomer);
      mockPrisma.job.count.mockResolvedValue(0);
      mockPrisma.customer.delete.mockResolvedValue(mockCustomer);

      await service.deleteCustomer('1', true);

      expect(mockPrisma.customer.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });

  // ============================================================================
  // Contact Management Tests
  // ============================================================================

  describe('addContact', () => {
    it('should add contact to customer', async () => {
      const mockCustomer = {
        id: '1',
        customerName: 'Test Customer',
        contacts: [],
      };

      const mockContact = {
        id: 'c1',
        customerId: '1',
        contactName: 'John Doe',
        email: 'john@example.com',
        isPrimary: false,
      };

      mockPrisma.customer.findUnique.mockResolvedValue(mockCustomer);
      mockPrisma.customerContact.create.mockResolvedValue(mockContact);
      mockPrisma.customerContact.count.mockResolvedValue(1);
      mockPrisma.customerContact.update.mockResolvedValue({
        ...mockContact,
        isPrimary: true,
      });

      const result = await service.addContact({
        customerId: '1',
        contactName: 'John Doe',
        email: 'john@example.com',
      });

      expect(result.contactName).toBe('John Doe');
      expect(mockPrisma.customerContact.create).toHaveBeenCalled();
    });

    it('should set first contact as primary automatically', async () => {
      const mockCustomer = {
        id: '1',
        customerName: 'Test Customer',
        contacts: [],
      };

      mockPrisma.customer.findUnique.mockResolvedValue(mockCustomer);
      mockPrisma.customerContact.create.mockResolvedValue({
        id: 'c1',
        customerId: '1',
        contactName: 'John Doe',
        isPrimary: false,
      });
      mockPrisma.customerContact.count.mockResolvedValue(1);
      mockPrisma.customerContact.update.mockResolvedValue({});
      mockPrisma.customer.update.mockResolvedValue({});

      await service.addContact({
        customerId: '1',
        contactName: 'John Doe',
      });

      // Should update contact to set isPrimary = true
      expect(mockPrisma.customerContact.update).toHaveBeenCalled();
      // Should update customer's primaryContactId
      expect(mockPrisma.customer.update).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // Pricing Tier Tests
  // ============================================================================

  describe('getCurrentPricingTier', () => {
    it('should return active pricing tier', async () => {
      const mockCustomer = {
        id: '1',
        customerName: 'Test Customer',
      };

      const mockTier = {
        id: 't1',
        customerId: '1',
        tierName: 'TIER_1',
        discountPercentage: 15.0,
        effectiveDate: new Date('2025-01-01'),
        expirationDate: new Date('2025-12-31'),
      };

      mockPrisma.customer.findUnique.mockResolvedValue(mockCustomer);
      mockPrisma.customerPricingTier.findFirst.mockResolvedValue(mockTier);

      const result = await service.getCurrentPricingTier('1');

      expect(result).toEqual(mockTier);
      expect(mockPrisma.customerPricingTier.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            customerId: '1',
            effectiveDate: expect.any(Object),
          }),
        })
      );
    });

    it('should return null if no active tier', async () => {
      const mockCustomer = {
        id: '1',
        customerName: 'Test Customer',
      };

      mockPrisma.customer.findUnique.mockResolvedValue(mockCustomer);
      mockPrisma.customerPricingTier.findFirst.mockResolvedValue(null);

      const result = await service.getCurrentPricingTier('1');

      expect(result).toBeNull();
    });
  });

  describe('addPricingTier', () => {
    it('should validate date ranges', async () => {
      const invalidInput = {
        customerId: '1',
        tierName: 'TIER_1',
        discountPercentage: 15.0,
        effectiveDate: new Date('2025-12-31'),
        expirationDate: new Date('2025-01-01'), // Before effective date
      };

      await expect(service.addPricingTier(invalidInput)).rejects.toThrow();
    });

    it('should validate discount percentage range', async () => {
      const invalidInput = {
        customerId: '1',
        tierName: 'TIER_1',
        discountPercentage: 150.0, // Over 100%
        effectiveDate: new Date('2025-01-01'),
      };

      await expect(service.addPricingTier(invalidInput)).rejects.toThrow();
    });
  });

  // ============================================================================
  // External ID Mapping Tests
  // ============================================================================

  describe('mapExternalId', () => {
    it('should map customer to external system', async () => {
      const mockCustomer = {
        id: '1',
        customerName: 'Test Customer',
      };

      const mockExternalId = {
        id: 'e1',
        customerId: '1',
        externalSystem: 'SALES_1440',
        externalCustomerId: 'CUST-001',
        isPrimary: true,
      };

      mockPrisma.customer.findUnique.mockResolvedValue(mockCustomer);
      mockPrisma.customerExternalId.findUnique.mockResolvedValue(null);
      mockPrisma.customerExternalId.create.mockResolvedValue(mockExternalId);

      const result = await service.mapExternalId({
        customerId: '1',
        externalSystem: 'SALES_1440',
        externalCustomerId: 'CUST-001',
        isPrimary: true,
      });

      expect(result.externalCustomerId).toBe('CUST-001');
    });

    it('should throw error if duplicate mapping exists', async () => {
      const mockCustomer = {
        id: '1',
        customerName: 'Test Customer',
      };

      mockPrisma.customer.findUnique.mockResolvedValue(mockCustomer);
      mockPrisma.customerExternalId.findUnique.mockResolvedValue({
        id: 'e1',
        customerId: '1',
        externalSystem: 'SALES_1440',
        externalCustomerId: 'CUST-001',
      });

      await expect(
        service.mapExternalId({
          customerId: '1',
          externalSystem: 'SALES_1440',
          externalCustomerId: 'CUST-001',
        })
      ).rejects.toThrow(DuplicateExternalIdError);
    });
  });

  describe('findByExternalId', () => {
    it('should find customer by external system ID', async () => {
      const mockCustomer = {
        id: '1',
        customerName: 'Test Customer',
        customerType: CustomerType.PRODUCTION,
      };

      const mockExternalId = {
        id: 'e1',
        customerId: '1',
        externalSystem: 'SALES_1440',
        externalCustomerId: 'CUST-001',
        customer: mockCustomer,
      };

      mockPrisma.customerExternalId.findFirst.mockResolvedValue(mockExternalId);
      mockPrisma.customer.findUnique.mockResolvedValue({
        ...mockCustomer,
        contacts: [],
        pricingTiers: [],
        externalIds: [],
      });

      const result = await service.findByExternalId('SALES_1440', 'CUST-001');

      expect(result.customerName).toBe('Test Customer');
    });
  });
});

/**
 * Test Execution Instructions:
 *
 * 1. Install Jest and testing dependencies:
 *    npm install --save-dev jest @types/jest ts-jest
 *
 * 2. Add to package.json scripts:
 *    "test": "jest",
 *    "test:watch": "jest --watch"
 *
 * 3. Create jest.config.js:
 *    module.exports = {
 *      preset: 'ts-jest',
 *      testEnvironment: 'node',
 *    };
 *
 * 4. Run tests:
 *    npm test
 *
 * Expected Output:
 * ✓ All repository methods work
 * ✓ Service validates inputs
 * ✓ Can create customer with contacts
 * ✓ getCurrentPricingTier returns correct tier
 */
