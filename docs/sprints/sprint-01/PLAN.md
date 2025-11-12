# Sprint 1: Security Foundation & Critical Fixes

**Sprint Number**: 1
**Phase**: Foundation (Phase 1)
**Duration**: 2 weeks
**Started**: 2025-11-09
**Target End**: 2025-11-23
**Status**: 🟢 Active

---

## 🎯 Sprint Objectives

### Primary Goal
Eliminate critical security vulnerabilities and establish security-first foundation before any feature development.

### Success Criteria
- ✅ Zero critical security vulnerabilities
- ✅ Production server requires proper JWT_SECRET
- ✅ Rate limiting prevents brute force attacks
- ✅ All security headers properly configured
- ✅ Audit logging captures all auth events
- ✅ No hardcoded credentials in codebase
- ✅ CSP configured and tested
- ✅ Database connections properly limited
- ✅ API versioning strategy established

---

## 📋 Tasks Breakdown

### Week 1: Critical Security Fixes

#### Day 1: JWT_SECRET Validation
**Priority**: 🔴 CRITICAL
**Estimated Time**: 1 hour
**File**: `backend/src/server.ts`

**Task**:
```typescript
// Add before server startup
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is required in production');
  console.error('Set JWT_SECRET to a cryptographically secure random string (min 32 characters)');
  process.exit(1);
}

// Add warning in development
if (process.env.NODE_ENV === 'development' && !process.env.JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET not set. Using development default.');
  console.warn('This is ONLY acceptable in development. NEVER in production.');
}
```

**Testing**:
- [ ] Start server without JWT_SECRET in production mode (should fail)
- [ ] Start server with JWT_SECRET in production mode (should succeed)
- [ ] Start server in development mode (should work with warning)
- [ ] Verify error message is clear and actionable

**Connected Parts to Verify**:
- [ ] Auth service still functions
- [ ] Token generation still works
- [ ] Token validation still works

---

#### Day 2: Remove Hardcoded Credentials
**Priority**: 🔴 CRITICAL
**Estimated Time**: 1.5 hours
**Files**: `backend/prisma/seed.ts`, any test files

**Tasks**:
1. Review seed data for hardcoded passwords
2. Create environment variable for seed password: `SEED_USER_PASSWORD`
3. Update seed.ts to use environment variable
4. Add check to prevent seed in production
5. Document seed credentials in README (development only)

**Code Changes**:
```typescript
// backend/prisma/seed.ts
if (process.env.NODE_ENV === 'production') {
  throw new Error('Seed script should not be run in production');
}

const seedPassword = process.env.SEED_USER_PASSWORD || 'DevPassword123!';
if (process.env.NODE_ENV === 'production' && !process.env.SEED_USER_PASSWORD) {
  throw new Error('SEED_USER_PASSWORD required for production seed');
}
```

**Testing**:
- [ ] Run seed in development (works)
- [ ] Attempt seed in production without SEED_USER_PASSWORD (fails)
- [ ] Verify no passwords in git history
- [ ] Check .env.example has SEED_USER_PASSWORD documented

**Connected Parts to Verify**:
- [ ] Existing test users still work
- [ ] Auth tests still pass

---

#### Day 3: Security Headers Middleware
**Priority**: 🔴 HIGH
**Estimated Time**: 2 hours
**File**: `backend/src/middleware/securityHeaders.ts` (new file)

**Tasks**:
1. Install `helmet` package: `npm install helmet`
2. Create security headers middleware
3. Configure CSP (Content Security Policy)
4. Add to Express app before routes

**Code Implementation**:
```typescript
// backend/src/middleware/securityHeaders.ts
import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';

export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // TODO: Remove unsafe-inline in Sprint 3
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  frameguard: {
    action: 'deny',
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },
});

// Add API version header
export const apiVersionHeader = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-API-Version', 'v1');
  next();
};
```

**Integration**:
```typescript
// backend/src/server.ts
import { securityHeaders, apiVersionHeader } from './middleware/securityHeaders';

app.use(securityHeaders);
app.use(apiVersionHeader);
```

**Testing**:
- [ ] Check all security headers present in response
- [ ] Verify HSTS header: `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- [ ] Verify CSP header present
- [ ] Verify X-Frame-Options: DENY
- [ ] Verify X-Content-Type-Options: nosniff
- [ ] Verify X-XSS-Protection: 1; mode=block
- [ ] Verify X-API-Version: v1

**Connected Parts to Verify**:
- [ ] Frontend can still connect
- [ ] API calls still work
- [ ] No CSP violations in console

---

#### Day 4: CORS Hardening
**Priority**: 🔴 HIGH
**Estimated Time**: 1.5 hours
**File**: `backend/src/middleware/cors.ts` (update existing)

**Tasks**:
1. Update CORS configuration for production
2. Create whitelist-based origin checking
3. Add environment variable for allowed origins
4. Document CORS configuration

**Code Implementation**:
```typescript
// backend/src/middleware/cors.ts
import cors from 'cors';

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173']; // Development default

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Version'],
  exposedHeaders: ['X-API-Version'],
  maxAge: 86400, // 24 hours
};

export const corsMiddleware = cors(corsOptions);
```

**Environment Variables**:
```bash
# .env.example
ALLOWED_ORIGINS=http://localhost:5173,https://yourdomain.com
```

**Testing**:
- [ ] Request from allowed origin (succeeds)
- [ ] Request from disallowed origin (blocked)
- [ ] Preflight OPTIONS requests work
- [ ] Credentials included in CORS response
- [ ] CORS headers present in response

**Connected Parts to Verify**:
- [ ] Frontend development still works
- [ ] API calls from frontend succeed
- [ ] Postman/curl still works (no origin)

---

#### Day 5: Audit Logging Foundation
**Priority**: 🟡 HIGH
**Estimated Time**: 2 hours
**Files**: `backend/src/services/auditLog.ts` (new), update auth routes

**Tasks**:
1. Create audit logging service
2. Add audit logs to auth operations
3. Test audit log creation
4. Verify audit logs in database

**Code Implementation**:
```typescript
// backend/src/services/auditLog.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export enum AuditAction {
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  USER_REGISTER = 'USER_REGISTER',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  PASSWORD_RESET_REQUEST = 'PASSWORD_RESET_REQUEST',
  PASSWORD_RESET_COMPLETE = 'PASSWORD_RESET_COMPLETE',
  ROLE_CHANGE = 'ROLE_CHANGE',
  FAILED_LOGIN = 'FAILED_LOGIN',
}

interface AuditLogData {
  userId?: string;
  action: AuditAction;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  success: boolean;
}

export const createAuditLog = async (data: AuditLogData) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        metadata: data.metadata,
        success: data.success,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw - audit logging should never break the app
  }
};
```

**Integration in Auth Routes**:
```typescript
// backend/src/routes/auth.ts
import { createAuditLog, AuditAction } from '../services/auditLog';

// In login route
await createAuditLog({
  userId: user.id,
  action: AuditAction.USER_LOGIN,
  ipAddress: req.ip,
  userAgent: req.get('user-agent'),
  success: true,
});

// In failed login
await createAuditLog({
  action: AuditAction.FAILED_LOGIN,
  ipAddress: req.ip,
  userAgent: req.get('user-agent'),
  metadata: { email: req.body.email },
  success: false,
});
```

**Testing**:
- [ ] Login creates audit log
- [ ] Failed login creates audit log
- [ ] Registration creates audit log
- [ ] Audit logs visible in database
- [ ] IP address captured correctly
- [ ] User agent captured correctly

**Connected Parts to Verify**:
- [ ] Auth still works normally
- [ ] Failed audit log doesn't break auth
- [ ] Performance acceptable (<10ms overhead)

---

### Week 2: Hardening & Infrastructure

#### Day 6-7: Rate Limiting Implementation
**Priority**: 🔴 HIGH
**Estimated Time**: 3 hours
**File**: `backend/src/middleware/rateLimiter.ts` (new file)

**Tasks**:
1. Install rate limiting package: `npm install express-rate-limit`
2. Create rate limiting middleware
3. Configure different limits for different endpoints
4. Add to auth routes and global
5. Test rate limiting behavior

**Code Implementation**:
```typescript
// backend/src/middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// Strict rate limiting for auth endpoints
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: {
    error: 'Too many authentication attempts. Please try again in 15 minutes.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Too many requests',
      message: 'Too many authentication attempts. Please try again later.',
      retryAfter: Math.ceil((req.rateLimit.resetTime?.getTime() || Date.now()) / 1000),
    });
  },
});

// General API rate limiting
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    error: 'Too many requests. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiting for registration
export const registrationRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registrations per hour per IP
  message: {
    error: 'Too many registration attempts. Please try again in an hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
```

**Integration**:
```typescript
// backend/src/routes/auth.ts
import { authRateLimiter, registrationRateLimiter } from '../middleware/rateLimiter';

router.post('/login', authRateLimiter, loginController);
router.post('/register', registrationRateLimiter, registerController);

// backend/src/server.ts
import { apiRateLimiter } from './middleware/rateLimiter';

app.use('/api', apiRateLimiter); // Apply to all API routes
```

**Testing**:
- [ ] Make 6 login attempts (6th should be blocked)
- [ ] Wait 15 minutes, try again (should work)
- [ ] Make 101 API requests (101st should be blocked)
- [ ] Make 4 registration attempts (4th should be blocked)
- [ ] Check rate limit headers in response
- [ ] Verify different IPs have separate limits

**Connected Parts to Verify**:
- [ ] Normal auth flow still works
- [ ] Frontend handles 429 errors gracefully
- [ ] Rate limit doesn't affect legitimate users

---

#### Day 8: Database Connection Pooling
**Priority**: 🟡 MEDIUM
**Estimated Time**: 1.5 hours
**File**: `backend/src/config/database.ts` (new file)

**Tasks**:
1. Configure Prisma connection pooling
2. Set connection limits
3. Add connection health check
4. Document configuration

**Code Implementation**:
```typescript
// backend/src/config/database.ts
import { PrismaClient } from '@prisma/client';

const connectionLimit = process.env.DATABASE_CONNECTION_LIMIT
  ? parseInt(process.env.DATABASE_CONNECTION_LIMIT, 10)
  : 10;

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Connection pool configuration in DATABASE_URL
// Example: postgresql://user:pass@localhost:5433/db?connection_limit=10&pool_timeout=10

export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
};

export const closeDatabaseConnection = async () => {
  await prisma.$disconnect();
};
```

**Environment Variables**:
```bash
# .env.example
DATABASE_URL="postgresql://user:password@localhost:5433/mindflow?connection_limit=10&pool_timeout=10"
DATABASE_CONNECTION_LIMIT=10
```

**Integration**:
```typescript
// backend/src/server.ts
import { checkDatabaseConnection, closeDatabaseConnection } from './config/database';

// Before starting server
const dbConnected = await checkDatabaseConnection();
if (!dbConnected) {
  console.error('Failed to connect to database');
  process.exit(1);
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  await closeDatabaseConnection();
  process.exit(0);
});
```

**Testing**:
- [ ] Server starts with database connection
- [ ] Server fails to start if database unavailable
- [ ] Connection limit enforced (test with load)
- [ ] Graceful shutdown closes connections

**Connected Parts to Verify**:
- [ ] All database queries still work
- [ ] No connection leaks
- [ ] Performance acceptable under load

---

#### Day 9: API Versioning Strategy
**Priority**: 🟡 MEDIUM
**Estimated Time**: 2 hours
**Files**: `backend/src/routes/index.ts`, update all route files

**Tasks**:
1. Establish API versioning pattern
2. Move all routes under `/api/v1`
3. Create version middleware
4. Document versioning strategy

**Code Implementation**:
```typescript
// backend/src/routes/index.ts
import express from 'express';
import authRoutes from './auth';
import customerRoutes from './customers';
// ... other routes

const router = express.Router();

// Version 1 routes
const v1Router = express.Router();
v1Router.use('/auth', authRoutes);
v1Router.use('/customers', customerRoutes);
// ... other routes

router.use('/v1', v1Router);

export default router;

// backend/src/server.ts
import routes from './routes';

app.use('/api', routes); // All routes now under /api/v1/...
```

**Documentation**:
Create `docs/API_VERSIONING.md`:
```markdown
# API Versioning Strategy

## Current Version: v1

All API endpoints are prefixed with `/api/v1/`

### Examples
- Auth: `POST /api/v1/auth/login`
- Customers: `GET /api/v1/customers`

### Version Headers
All responses include `X-API-Version: v1`

### Deprecation Policy
- Versions supported for minimum 6 months after new version release
- Deprecation warnings sent via `X-API-Deprecated` header
- Breaking changes require new major version

### Future Versions
- v2: Planned for [future date] with [breaking changes]
```

**Testing**:
- [ ] All endpoints accessible at `/api/v1/*`
- [ ] Old endpoints (without `/v1`) return 404
- [ ] Version header present in all responses
- [ ] Update frontend to use `/api/v1/*`

**Connected Parts to Verify**:
- [ ] Frontend API calls updated
- [ ] All route tests updated
- [ ] Swagger docs updated (if exists)

---

#### Day 10: Final Testing & Documentation
**Priority**: 🟡 HIGH
**Estimated Time**: 2 hours

**Tasks**:
1. Run comprehensive security testing
2. Update documentation
3. Update changelog
4. Create sprint review
5. Prepare for Sprint 2

**Security Testing Checklist**:
- [ ] Run `npm audit` (backend & frontend) - must be clean
- [ ] Test JWT_SECRET validation
- [ ] Test rate limiting on all protected endpoints
- [ ] Verify CORS blocks unauthorized origins
- [ ] Check all security headers present
- [ ] Verify audit logs created for auth events
- [ ] Test CSP doesn't block legitimate requests
- [ ] Verify database connection limits
- [ ] Test API versioning
- [ ] Manual penetration testing (basic)

**Documentation Updates**:
- [ ] Update `docs/CHANGELOG.md` with Sprint 1 changes
- [ ] Complete `docs/sprints/sprint-01/REVIEW.md`
- [ ] Update `docs/SPRINT_PLAN.md` status
- [ ] Update README security section
- [ ] Document all security decisions

**Sprint Review**:
- [ ] Create `docs/sprints/sprint-01/REVIEW.md`
- [ ] List completed objectives
- [ ] Document lessons learned
- [ ] Note any deferred items
- [ ] Update sprint status to complete

---

## 📊 Success Metrics

### Security Metrics
- **Target**: Zero critical vulnerabilities
- **Target**: 100% audit log coverage for auth events
- **Target**: Rate limiting blocks brute force (test with 100 attempts)
- **Target**: All security headers present and correct

### Performance Metrics
- **Target**: < 10ms overhead from security middleware
- **Target**: < 5ms overhead from audit logging
- **Target**: Rate limiting response < 1ms

### Code Quality
- **Target**: All security code reviewed
- **Target**: Security middleware tested
- **Target**: Documentation complete

---

## 📦 Phase 1.5: Data Migration Strategy Review

**Timing**: After Sprint 1 Day 10, Before Sprint 2
**Duration**: 1-2 sessions
**Purpose**: Validate platform schema against real Excel data before heavy migration coding

### Background

User is developing Excel-to-Excel migration code as first step toward platform migration. Need to ensure migration approach aligns with platform schema before coding investment.

### Objectives

1. **Schema Alignment Check**
   - [ ] User shares Excel structure (columns, data types, relationships)
   - [ ] Map Excel columns to Prisma models
   - [ ] Identify missing fields or data type mismatches
   - [ ] Document gaps in current schema

2. **Migration Strategy Selection**
   - [ ] Evaluate Option A: Direct database import (SQL/Prisma scripts)
   - [ ] Evaluate Option B: API-based import (use `/api/v1` endpoints)
   - [ ] Evaluate Option C: Hybrid approach (bulk import + API validation)
   - [ ] Select recommended approach based on data characteristics

3. **Planning Deliverables**
   - [ ] Create `docs/data-migration/STRATEGY.md`
   - [ ] Create `docs/data-migration/EXCEL_SCHEMA_MAP.md`
   - [ ] Create `docs/data-migration/TRANSFORMATION_RULES.md`
   - [ ] Document rollback/recovery strategy

4. **Platform Changes Identification**
   - [ ] List schema fields missing for Excel data
   - [ ] Identify need for bulk import endpoints
   - [ ] Document data validation rules to add
   - [ ] Plan any API enhancements needed

### Success Criteria

- ✅ Complete Excel to Prisma schema mapping document
- ✅ Migration strategy selected with clear rationale
- ✅ List of required platform changes (if any)
- ✅ User confident in migration approach
- ✅ No risk of migration code rework

### Impact on Sprint 2

**If schema changes needed**:
- Adjust Sprint 2 plan to include schema modifications
- Update migration timeline accordingly
- Document breaking changes

**If no changes needed**:
- Proceed with Sprint 2 as planned
- Begin migration code with confidence
- Platform validated against real data

### Files to Review

- `backend/prisma/schema.prisma` - Current database schema
- User's Excel files - Source data structure
- `docs/data-migration/` - New directory for migration docs

### Questions to Answer

1. Does the Excel data reveal schema gaps?
2. Should migration be direct SQL or API-based?
3. Do we need schema changes before Sprint 2?
4. Should we build bulk import endpoints now or later?
5. Does this discovery change Phase 2 priorities?

---

## 🔒 Security Validation Checklist

Run after sprint completion:

- [ ] No new hardcoded secrets or credentials
- [ ] JWT_SECRET required in production
- [ ] Rate limiting prevents brute force
- [ ] CORS properly configured
- [ ] Security headers present
- [ ] Audit logging operational
- [ ] CSP configured
- [ ] Connection pooling limited
- [ ] API versioning established
- [ ] `npm audit` clean
- [ ] No sensitive data in logs
- [ ] HTTPS ready (headers configured)

---

## 🧪 Testing Strategy

### Unit Tests
- [ ] JWT_SECRET validation logic
- [ ] Rate limiter configuration
- [ ] Audit log creation
- [ ] CORS origin checking

### Integration Tests
- [ ] Auth flow with rate limiting
- [ ] Audit logs created on auth events
- [ ] Security headers in responses
- [ ] API versioning routes

### Manual Testing
- [ ] Brute force login attempts (should be blocked)
- [ ] Invalid origin CORS request (should be blocked)
- [ ] Server startup without JWT_SECRET (should fail in production)
- [ ] Database connection failure (should fail gracefully)

---

## 📝 Documentation Deliverables

- [ ] `docs/sprints/sprint-01/PLAN.md` (this file)
- [ ] `docs/sprints/sprint-01/PROGRESS.md` (daily updates)
- [ ] `docs/sprints/sprint-01/DECISIONS.md` (technical decisions)
- [ ] `docs/sprints/sprint-01/TESTING.md` (test results)
- [ ] `docs/sprints/sprint-01/REVIEW.md` (retrospective)
- [ ] `docs/API_VERSIONING.md` (API versioning strategy)
- [ ] Updated `docs/CHANGELOG.md`

---

## 🚧 Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| CSP blocks legitimate requests | High | Medium | Test thoroughly, document exclusions |
| Rate limiting affects legitimate users | Medium | Low | Set reasonable limits, monitor |
| Performance degradation | Medium | Low | Benchmark, optimize if needed |
| CORS misconfig breaks frontend | High | Low | Test with frontend, document allowed origins |

---

## 📞 References

- **Security Best Practices**: OWASP Top 10
- **Rate Limiting**: [express-rate-limit docs](https://www.npmjs.com/package/express-rate-limit)
- **Security Headers**: [helmet docs](https://helmetjs.github.io/)
- **CSP Guide**: [MDN CSP Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

---

**Sprint Status**: 🟢 Active (Day 9 Complete)
**Last Updated**: 2025-11-12
**Next Update**: Daily progress log
**Phase 1.5**: Data Migration Strategy Review (scheduled after Day 10)
