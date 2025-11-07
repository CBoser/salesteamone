// Custom Error Classes for Customer Module

export class CustomerNotFoundError extends Error {
  constructor(identifier: string) {
    super(`Customer not found: ${identifier}`);
    this.name = 'CustomerNotFoundError';
  }
}

export class CustomerHasDependenciesError extends Error {
  constructor(customerId: string, dependencies: string[]) {
    super(
      `Cannot delete customer ${customerId}. Has dependencies: ${dependencies.join(', ')}`
    );
    this.name = 'CustomerHasDependenciesError';
  }
}

export class InvalidCustomerDataError extends Error {
  constructor(message: string, public errors?: any) {
    super(message);
    this.name = 'InvalidCustomerDataError';
  }
}

export class CustomerContactNotFoundError extends Error {
  constructor(contactId: string) {
    super(`Customer contact not found: ${contactId}`);
    this.name = 'CustomerContactNotFoundError';
  }
}

export class CustomerPricingTierNotFoundError extends Error {
  constructor(tierId: string) {
    super(`Customer pricing tier not found: ${tierId}`);
    this.name = 'CustomerPricingTierNotFoundError';
  }
}

export class CustomerExternalIdNotFoundError extends Error {
  constructor(externalIdId: string) {
    super(`Customer external ID not found: ${externalIdId}`);
    this.name = 'CustomerExternalIdNotFoundError';
  }
}

export class DuplicateExternalIdError extends Error {
  constructor(system: string, externalId: string) {
    super(
      `External ID already exists for system ${system}: ${externalId}`
    );
    this.name = 'DuplicateExternalIdError';
  }
}
