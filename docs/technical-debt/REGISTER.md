# Technical Debt Register

**Purpose**: Track all workarounds, deferred work, and technical compromises that need future attention.

**Review Cadence**: Weekly (every Friday during weekly review)

---

## Active Technical Debt

### HIGH Priority

#### TD-001: Plan Routes Disabled Due to Schema Mismatch
- **Created**: 2025-11-09 (Sprint 1 Day 3)
- **Location**: `backend/src/index.ts:68` (commented out)
- **Impact**: Plan management features completely unavailable
- **Root Cause**: Service implementation expects fields that don't exist in schema
- **Errors**: 18+ TypeScript compilation errors
- **Estimated Effort**: 6-8 hours
- **Target Sprint**: Sprint 6-7
- **Details**:
  ```typescript
  // Expected by service but missing in schema:
  // - customerId (string)
  // - planNumber (string)
  // - description (string)
  // - estimatedCost (Decimal)
  // - isTemplate (boolean)
  ```
- **Resolution Plan**:
  1. Align schema with service expectations OR
  2. Refactor service to match actual schema
  3. Run migration if schema changes needed
  4. Re-enable routes and test thoroughly

---

#### TD-002: Material Routes Disabled Due to Schema Mismatch
- **Created**: 2025-11-09 (Sprint 1 Day 3)
- **Location**: `backend/src/index.ts:69` (commented out)
- **Impact**: Material management features completely unavailable
- **Root Cause**: Service expects MaterialPricing model with different structure
- **Errors**: 25+ TypeScript compilation errors
- **Estimated Effort**: 8-10 hours
- **Target Sprint**: Sprint 8-9
- **Details**:
  ```typescript
  // Schema mismatches:
  // - MaterialPricing model structure different
  // - Missing supplier property on Material
  // - Different field types (string vs Decimal)
  // - Missing relationships
  ```
- **Resolution Plan**:
  1. Review actual database schema vs. service expectations
  2. Decide on canonical schema design
  3. Update Prisma schema
  4. Run migration
  5. Update service layer to match
  6. Re-enable routes and test

---

### MEDIUM Priority

#### TD-003: Prisma Type Stubs Workaround
- **Created**: 2025-11-09 (Sprint 1 Day 3)
- **Location**: `backend/src/types/prisma.d.ts`
- **Impact**: TypeScript compilation works, but types are not fully accurate
- **Root Cause**: Prisma Client generation fails in sandbox environment
- **Risk**: Type safety compromised, may miss type errors
- **Estimated Effort**: 2-3 hours (environmental fix)
- **Target Sprint**: Sprint 1 completion or Sprint 2
- **Details**:
  - Created manual type declarations for all Prisma models
  - Uses `any` for complex types (Decimal, JSON)
  - May not reflect actual generated types exactly
- **Resolution Plan**:
  1. Investigate why Prisma generation fails in sandbox
  2. Fix environment configuration OR
  3. Accept as permanent workaround (acceptable if types are accurate)
  4. Validate types match actual database schema
  5. Remove type stubs if Prisma Client can generate properly

---

#### TD-004: Missing JWT Validation Test Execution
- **Created**: 2025-11-09 (Sprint 1 Day 3)
- **Location**: Test deferred, not executed
- **Impact**: JWT validation not formally tested across environments
- **Risk**: Production JWT issues may not be caught
- **Estimated Effort**: 1-2 hours
- **Target Sprint**: Sprint 1 Day 4
- **Details**:
  - Test script exists: `backend/src/tests/test-jwt-validation.js`
  - Not executed during Day 3 due to time constraints
  - Need to test dev, staging, production configurations
- **Resolution Plan**:
  1. Run existing test script
  2. Test with short JWT_SECRET (should fail)
  3. Test with proper JWT_SECRET (should pass)
  4. Test in different NODE_ENV values
  5. Document results

---

### LOW Priority

#### TD-005: Test Files Excluded from TypeScript Compilation
- **Created**: 2025-11-09 (Sprint 1 Day 3)
- **Location**: `backend/tsconfig.json:17`
- **Impact**: Test files not type-checked during compilation
- **Root Cause**: Jest types not available, 50+ errors in test files
- **Risk**: Type errors in tests won't be caught until test execution
- **Estimated Effort**: 2-3 hours
- **Target Sprint**: Sprint 2
- **Details**:
  ```json
  "exclude": ["node_modules", "dist", "src/**/__tests__/**", "src/**/*.test.ts", "src/**/*.spec.ts"]
  ```
- **Resolution Plan**:
  1. Install Jest types: `npm install -D @types/jest`
  2. Configure Jest properly in tsconfig
  3. Fix any remaining type errors in tests
  4. Remove exclusion from tsconfig
  5. Ensure tests pass TypeScript compilation

---

#### TD-006: Implicit 'any' Type Warnings
- **Created**: 2025-11-09 (Sprint 1 Day 3)
- **Location**: Various files (12 instances)
- **Impact**: Reduced type safety in isolated areas
- **Risk**: Low - non-blocking warnings
- **Estimated Effort**: 2-4 hours (gradual cleanup)
- **Target Sprint**: Sprint 2-3 (ongoing)
- **Files Affected**:
  - `middleware/errorHandler.ts`
  - `services/CustomerService.ts`
  - Other scattered locations
- **Resolution Plan**:
  1. Enable `noImplicitAny` in tsconfig (currently off)
  2. Fix warnings incrementally
  3. Add proper type annotations
  4. No rush - can be done gradually

---

#### TD-007: No Sprint Documentation Structure
- **Created**: 2025-11-09 (Sprint 1 Day 3)
- **Location**: Missing `docs/sprints/` formal structure
- **Impact**: Sprint progress not formally documented
- **Risk**: Low - retrospective created, but day-by-day logs missing
- **Estimated Effort**: 1-2 hours
- **Target Sprint**: Sprint 1 Day 4
- **Resolution Plan**:
  1. Create `docs/sprints/sprint-01/day-01.md` template
  2. Backfill Days 1-3 based on work completed
  3. Use template for Days 4-10
  4. Include in daily workflow

---

## Resolved Technical Debt

### ✅ TD-000: Example Resolved Debt
- **Created**: 2025-11-XX
- **Resolved**: 2025-11-XX
- **Resolution**: Description of how it was resolved
- **Lessons Learned**: What we learned from resolving this

---

## Technical Debt Metrics

**Total Active Debt**: 7 items
- High Priority: 2 items (~14-18 hours)
- Medium Priority: 2 items (~3-5 hours)
- Low Priority: 3 items (~5-9 hours)

**Total Estimated Effort**: ~22-32 hours

**Debt by Sprint**:
- Sprint 1: 4 items (TD-003, TD-004, TD-006, TD-007)
- Sprint 2: 2 items (TD-005, TD-006 continued)
- Sprint 6-7: 1 item (TD-001)
- Sprint 8-9: 1 item (TD-002)

**Trend**: Increasing (new project, expected)

---

## Debt Prevention Strategies

### Implemented
- ✅ TypeScript strict mode enabled
- ✅ ESLint for code quality
- ✅ Prisma for schema management

### Recommended
- [ ] Schema validation in CI/CD pipeline
- [ ] Pre-commit hooks for TypeScript compilation
- [ ] Automated test execution before merge
- [ ] Weekly technical debt review
- [ ] "Definition of Done" includes no new tech debt

---

## Review History

### 2025-11-09 - Initial Register Created
- **Items Added**: 7
- **Items Resolved**: 0
- **Notes**: First technical debt register. All items from Sprint 1 Days 1-3.

---

**Last Updated**: 2025-11-09
**Next Review**: 2025-11-15 (Friday)
