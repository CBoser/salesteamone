// Shared TypeScript types for MindFlow

export interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Plan {
  id: string;
  code: string;
  name?: string;
  type: 'Single Story' | 'Two Story' | 'Three Story' | 'Duplex' | 'Townhome';
  sqft?: number;
  bedrooms?: number;
  bathrooms?: number;
  garage?: string;
  style?: string;
  elevations: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Material {
  id: string;
  sku: string;
  description: string;
  category: string;
  subcategory?: string;
  unitOfMeasure: string;
  vendorCost: number;
  freight?: number;
  totalCost: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PricingItem {
  id: string;
  itemNumber: string;
  description: string;
  category: string;
  unitOfMeasure: string;
  unitCost: number;
  margin: number;
  unitPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Community {
  id: string;
  name: string;
  builder: string;
  shippingYard: string;
  activePlans: number;
  specialRequirements?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Pack {
  id: string;
  name: string;
  category: string;
  daySingle?: number;
  dayTwo?: number;
  leadTime: number;
  materialCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Option {
  id: string;
  code: string;
  description: string;
  category: string;
  basePrice: number;
  triggersPacks?: string[];
  appliesTo?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface HealthCheckResponse {
  status: 'ok' | 'error';
  message: string;
  timestamp: string;
}
