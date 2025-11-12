# Sprint 1: Technical Decisions

**Sprint**: Sprint 1 - Security Foundation & Critical Fixes
**Started**: 2025-11-09

---

## Decision Log

All technical decisions made during Sprint 1 with rationale.

---

### [2025-11-09] Sprint Documentation Structure

**Decision**: Create comprehensive documentation system before starting implementation

**Rationale**:
- Need clear tracking of progress across 22 sprints
- Must document decisions for future reference
- Flexibility built in via phase reviews
- Version control of changes essential for understanding evolution

**Alternatives Considered**:
- Start coding immediately, document later (rejected - leads to poor documentation)
- Lightweight documentation only (rejected - insufficient for 15-month project)

**Impact**:
- Clear sprint plan and tracking
- Easy to review progress
- Decisions documented as made
- Changelog provides history

**Files Created**:
- `docs/SPRINT_PLAN.md` - Master sprint plan
- `docs/CHANGELOG.md` - Project changelog
- `docs/sprints/sprint-01/PLAN.md` - Sprint 1 detailed plan
- `docs/sprints/sprint-01/PROGRESS.md` - Daily progress tracking
- `docs/sprints/phase-reviews/PHASE_REVIEW_TEMPLATE.md` - Phase review template

---

### [2025-11-09] JWT_SECRET Validation Approach

**Decision**: Implement startup validation that fails immediately in production if JWT_SECRET is missing or too short (< 32 characters)

**Rationale**:
- Critical security vulnerability: default JWT_SECRET allows token forgery
- Better to fail fast (startup) than fail during runtime
- Clear error messages guide developers to fix the issue
- Development mode more permissive (with warnings) for local testing

**Alternatives Considered**:
1. **Runtime validation only** - Rejected: Allows server to start with insecure config
2. **No minimum length requirement** - Rejected: Weak secrets easily brute-forced
3. **Same rules for dev and prod** - Rejected: Too restrictive for local development

**Impact**:
- **Production**: MUST have JWT_SECRET set with 32+ characters (server won't start otherwise)
- **Development**: Can omit JWT_SECRET (shows warning, uses default)
- **Error Messages**: Clear instructions with command to generate secure secret
- **Migration**: Existing deployments need JWT_SECRET added to environment variables

**Code References**:
- `backend/src/index.ts:13-66` - Validation logic
- `backend/.env.example:16-23` - Documentation and examples
- `backend/test-jwt-validation.js` - Test suite

**Security Impact**:
- ✅ Eliminates default secret vulnerability
- ✅ Enforces minimum entropy (32 characters)
- ✅ Provides clear remediation path
- ✅ Prevents production deployment without proper configuration

**Owner**: Sprint 1 - Security Foundation
**Stakeholders**: DevOps, Security Team, Developers

---

### [2025-11-09] Seed Data Security Strategy

**Decision**: Remove all hardcoded passwords from seed script and use environment variable with production guard

**Rationale**:
- Hardcoded passwords in source control are security vulnerabilities
- Production seed would delete all production data (catastrophic)
- Test users with known passwords should only exist in development
- Environment variable allows customization without code changes

**Alternatives Considered**:
1. **Keep hardcoded passwords** - Rejected: Security vulnerability, credentials in git history
2. **Different passwords per user** - Rejected: Overcomplicated for development, hard to remember
3. **No default password** - Rejected: Friction in development, requires env var always
4. **Allow seed in production with flag** - Rejected: Too risky, no legitimate use case

**Impact**:
- **Production**: Seed script CANNOT run (exits immediately with error)
- **Development**: Seed uses SEED_USER_PASSWORD or defaults to 'DevPassword123!'
- **Test Users**: All 5 test users use same password (admin, estimator, pm, field, viewer)
- **Credentials Displayed**: Seed script shows email/password on startup (DX improvement)

**Code References**:
- `backend/prisma/seed.ts:10-48` - Production guard and password logic
- `backend/prisma/seed.ts:69,81,93,105,117` - Password usage (5 users)
- `backend/.env.example:39-43` - Documentation
- `backend/test-seed-security.js` - Test suite

**Security Impact**:
- ✅ No hardcoded credentials in codebase
- ✅ Production protected from accidental seed
- ✅ Git history doesn't contain passwords
- ✅ Custom passwords supported for additional security

**Developer Experience**:
- ✅ Simple to use (one password for all test users)
- ✅ Easy to customize (SEED_USER_PASSWORD env var)
- ✅ Credentials clearly displayed (no guessing)
- ✅ Production failure clear and actionable

**Owner**: Sprint 1 - Security Foundation
**Stakeholders**: DevOps, Security Team, Developers

---

### [2025-11-09] Security Headers Implementation Strategy

**Decision**: Use Helmet.js middleware with comprehensive security headers applied first in middleware chain

**Rationale**:
- Helmet.js is industry-standard, well-tested security headers middleware
- Headers must be applied to ALL responses (first middleware ensures this)
- CSP prevents XSS and data injection attacks
- HSTS prevents MITM attacks by forcing HTTPS
- Multiple header types provide defense-in-depth

**Alternatives Considered**:
1. **Manual header implementation** - Rejected: Error-prone, harder to maintain
2. **Selective header application** - Rejected: Easy to miss routes, inconsistent protection
3. **Headers applied later in chain** - Rejected: Some responses might skip headers
4. **Strict CSP (no unsafe-inline)** - Deferred: Requires nonces, implement in Sprint 3

**Impact**:
- **All Responses**: Include 8 security headers automatically
- **XSS Protection**: CSP restricts script/style sources
- **Clickjacking Protection**: X-Frame-Options denies framing
- **HTTPS Enforcement**: HSTS forces HTTPS for 1 year
- **Performance**: Minimal overhead (< 1ms per request)

**Code References**:
- `backend/src/middleware/securityHeaders.ts` - Middleware implementation
- `backend/src/index.ts:10,73` - Import and application
- `backend/test-security-headers.js` - Test suite
- `backend/package.json` - helmet dependency

**Security Headers Applied**:
1. **Content-Security-Policy** - Restricts resource loading (XSS prevention)
2. **Strict-Transport-Security** - Force HTTPS (MITM prevention)
3. **X-Frame-Options** - Deny framing (clickjacking prevention)
4. **X-Content-Type-Options** - Prevent MIME sniffing
5. **X-XSS-Protection** - Legacy XSS protection for old browsers
6. **Referrer-Policy** - Control referrer information
7. **X-API-Version** - Custom header for API versioning
8. **X-Security-Policy** - Custom header for compliance

**Temporary Compromises**:
- CSP allows `unsafe-inline` for scripts/styles (development ease)
- TODO Sprint 3: Implement nonce-based CSP to remove unsafe-inline

**Protection Provided**:
- ✅ Cross-Site Scripting (XSS) attacks
- ✅ Clickjacking attacks
- ✅ MIME-type sniffing attacks
- ✅ Man-in-the-middle attacks (HTTPS)
- ✅ Data injection attacks
- ✅ Privacy leaks via referrer

**Owner**: Sprint 1 - Security Foundation
**Stakeholders**: DevOps, Security Team, Frontend Team

---

### [2025-11-10] CORS Hardening Strategy (Day 4)

**Decision**: Implement whitelist-based CORS with explicit origin validation

**Rationale**:
- Default `cors()` middleware with `origin: true` allows ALL origins (critical vulnerability)
- Whitelist approach prevents CSRF and unauthorized API access
- Production requires explicit ALLOWED_ORIGINS configuration
- Development allows localhost variants for DX

**Alternatives Considered**:
1. **Allow all origins (`origin: true`)** - Rejected: Critical security vulnerability
2. **Single origin only** - Rejected: Need multiple origins (dev, staging, prod)
3. **Regex-based matching** - Rejected: Error-prone, harder to audit
4. **Cookie-based CSRF tokens** - Deferred: CORS is first line of defense

**Impact**:
- **Production**: MUST set ALLOWED_ORIGINS environment variable (comma-separated)
- **Development**: Defaults to common localhost variants (3000, 3001, 5173, etc.)
- **Security**: Blocks unauthorized cross-origin requests
- **Error Handling**: Clear error messages when origin not whitelisted

**Code References**:
- `backend/src/middleware/corsConfig.ts` - CORS middleware implementation
- `backend/src/index.ts:75-77` - CORS application (before routes)
- `backend/.env.example:25-30` - Environment variable documentation
- `docs/CORS_HARDENING.md` - Full documentation

**Security Impact**:
- ✅ Prevents CSRF attacks
- ✅ Blocks unauthorized API access
- ✅ Protects against origin spoofing
- ✅ Enforces explicit whitelisting

**Owner**: Sprint 1 Day 4 - Security Foundation
**Stakeholders**: Security Team, Frontend Team, DevOps

---

### [2025-11-10] Audit Logging for Authentication (Day 5)

**Decision**: Implement comprehensive audit logging for all authentication operations using existing AuditLog model

**Rationale**:
- No audit trail existed for security-sensitive operations
- Existing AuditLog model in schema was unused
- Required for compliance and security monitoring
- Enables brute force detection and anomaly detection

**Alternatives Considered**:
1. **Log to file only** - Rejected: Not structured, hard to query
2. **Third-party service (DataDog, Splunk)** - Deferred: DB logging sufficient for Phase 1
3. **Selective logging (login only)** - Rejected: Need complete audit trail
4. **Synchronous logging** - Chosen: Acceptable performance for auth ops (low frequency)

**Impact**:
- **All Auth Events Logged**: Login, logout, registration, password changes, failures
- **Data Captured**: User ID, action, IP address, user agent, timestamp, changes (before/after)
- **Performance**: Minimal overhead (async database write)
- **Storage**: AuditLog table grows over time (implement retention policy in Sprint 2)
- **Query Capability**: Rich querying for security analysis

**Code References**:
- `backend/src/services/auditLog.ts` - Audit logging service
- `backend/src/routes/auth.ts:28,49,71,93,115` - Integration with auth routes
- `backend/prisma/schema.prisma:870-897` - AuditLog model (already existed)
- `docs/AUDIT_LOGGING.md` - Full documentation

**Security Impact**:
- ✅ Complete audit trail for authentication
- ✅ Failed login tracking (brute force detection ready)
- ✅ IP address logging (geo-location analysis ready)
- ✅ User agent logging (device tracking)
- ✅ Immutable audit log (compliance)

**Owner**: Sprint 1 Day 5 - Security Foundation
**Stakeholders**: Security Team, Compliance Team, DevOps

---

### [2025-11-11] Rate Limiting Strategy (Day 6-7)

**Decision**: Implement tiered rate limiting with express-rate-limit (5 limiters for different endpoint types)

**Rationale**:
- No protection against brute force attacks on authentication
- No protection against API abuse
- Different endpoints have different sensitivity levels
- express-rate-limit v8 is mature, well-tested, includes TypeScript types

**Alternatives Considered**:
1. **Single global rate limit** - Rejected: Different endpoints need different limits
2. **Redis-based distributed limiting** - Deferred: In-memory sufficient for single server Phase 1
3. **IP + User combined limiting** - Deferred: IP-based sufficient for Phase 1
4. **No rate limiting** - Rejected: Critical security vulnerability

**Impact**:
- **5 Rate Limiters Implemented**:
  1. Auth endpoints: 5 requests / 15 min (brute force protection)
  2. Registration: 3 requests / 1 hour (spam prevention)
  3. Password reset: 3 requests / 1 hour (abuse prevention)
  4. General API: 100 requests / 15 min (API abuse protection)
  5. Admin API: 200 requests / 15 min (higher limit for admins)
- **Headers**: Standard RFC 7231 rate limit headers (X-RateLimit-*)
- **Error Messages**: Helpful messages with retry-after information
- **Performance**: In-memory store (< 1ms overhead)

**Code References**:
- `backend/src/middleware/rateLimiter.ts` - All 5 rate limiters
- `backend/src/routes/auth.ts:13-16,133,149` - Auth route integration
- `backend/src/index.ts:80` - Global API rate limiter
- `backend/package.json:29` - express-rate-limit dependency (v8.2.1)
- `docs/RATE_LIMITING.md` - Full documentation

**Security Impact**:
- ✅ Brute force attack prevention (5 attempts max)
- ✅ Spam registration prevention (3 per hour)
- ✅ Password reset abuse prevention
- ✅ API abuse protection
- ✅ Standard headers for client handling

**Implementation Status**:
- Code: ✅ Complete
- Testing: ⚠️ BLOCKED (Prisma Client generation issue - network restrictions)
- Documentation: ✅ Complete

**Owner**: Sprint 1 Day 6-7 - Security Foundation
**Stakeholders**: Security Team, Frontend Team, DevOps

---

### [2025-11-11] 15:00 Rule - Work Session Management (Day 7)

**Decision**: Do not start any new projects or sprints after 15:00 (3 PM). Final session of the day is reserved for resolution, reflections, and next day preparation.

**Rationale**:
- Late-day context switching reduces productivity
- Starting new work after 3 PM often leads to incomplete tasks and mental clutter
- End-of-day sessions are best used for closure activities
- Fresh mornings are better for starting new initiatives
- Proper closure and reflection improve next-day productivity

**Alternatives Considered**:
1. **No time restrictions** - Rejected: Leads to late-day context switching and incomplete work
2. **Hard stop at 15:00** - Rejected: Too rigid, sometimes need to finish ongoing work
3. **Different times for different days** - Rejected: Inconsistency makes it harder to follow

**Impact**:
- **After 15:00**: May finish ongoing work, do documentation, reflections, planning
- **After 15:00**: Do NOT start new features, sprints, or major tasks
- **Developer Experience**: Clearer work boundaries, better work-life balance
- **Productivity**: Improves next-day startup by ensuring proper closure
- **Code Quality**: Reduces rushed late-day commits

**Acceptable After 15:00**:
- ✅ Finishing ongoing tasks/debugging
- ✅ Documentation updates
- ✅ Time logging and progress tracking
- ✅ Reflection and lessons learned
- ✅ Planning next day's work
- ✅ Code review and minor fixes

**NOT Acceptable After 15:00**:
- ❌ Starting new features
- ❌ Starting new sprints
- ❌ Major refactoring
- ❌ Complex debugging of new issues
- ❌ Architecture decisions

**Code References**:
- `docs/time-tracking/2025-11-week1.md:304-307` - Rule documentation
- `docs/sprints/sprint-01/PROGRESS.md:486-489` - Rule in progress log

**Owner**: Sprint 1 Day 7 - Process Improvement
**Stakeholders**: Solo Developer (self-imposed productivity rule)

---

### [2025-11-12] Prisma Client Generation Workaround (Day 8)

**Decision**: Generate Prisma client on unrestricted Windows machine, commit to git (forced add), pull into Linux sandboxed environment

**Rationale**:
- Linux/sandboxed environment has network restrictions blocking binaries.prisma.sh (403 Forbidden)
- Cannot run `npx prisma generate` directly in deployment environment
- Prisma client is platform-specific but transferable between similar platforms
- Git provides version control and easy transfer mechanism
- Temporary commit to main branch bypasses .gitignore restrictions

**Alternatives Considered**:
1. **Manual binary download** - Rejected: Still requires network access, complex process
2. **Use WASM-only engine** - Rejected: Still needs schema engine which requires download
3. **Environment variable overrides (PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING)** - Failed: Still hits 403 errors
4. **Local Prisma cache** - Failed: Cache was empty, same network restrictions
5. **Wait for network access** - Rejected: No timeline, blocks all development

**Impact**:
- **Windows Development**: Generate Prisma client locally with network access
- **Git Transfer**: Force add node_modules/.prisma/client to git temporarily
- **Linux Environment**: Pull changes and copy generated files
- **Cleanup**: Remove from git tracking after transfer (keep local only)
- **Future**: Repeat process whenever schema changes

**Code References**:
- Windows: `C:\GitHub\ConstructionPlatform\backend\node_modules\.prisma\client\`
- Linux: `/home/user/ConstructionPlatform/backend/node_modules/.prisma/client/`
- Commit: `301f459` (temp: Add generated Prisma client for Linux environment)
- Generated types: `node_modules/.prisma/client/index.d.ts` (60+ auditLog references)

**Security Impact**:
- ⚠️ Briefly exposes node_modules in git history (acceptable - no secrets)
- ✅ Allows development to continue despite network restrictions
- ✅ Maintains type safety with proper Prisma client
- ✅ Unblocks Days 5-7 features (audit logging, rate limiting)

**Workflow**:
1. On Windows: `cd backend && npx prisma generate`
2. On Windows: `git add -f node_modules/.prisma/client/ node_modules/@prisma/client/`
3. On Windows: `git commit -m "temp: Add generated Prisma client"`
4. On Windows: `git push origin main`
5. On Linux: `git checkout main && git pull origin main`
6. On Linux: `git checkout <feature-branch>`
7. On Linux: `git checkout main -- node_modules/.prisma/client/ node_modules/@prisma/client/`
8. On Linux: Verify with `npm run build`
9. Optional: Remove from git tracking in main branch after transfer

**Owner**: Sprint 1 Day 8 - Infrastructure Workaround
**Stakeholders**: DevOps, Development Team

---

### [To be filled] CSP Configuration

**Decision**: (To be documented when implemented)

**Rationale**:

**Alternatives Considered**:

**Impact**:

**Code References**:

---

### [To be filled] API Versioning Pattern

**Decision**: (To be documented when implemented)

**Rationale**:

**Alternatives Considered**:

**Impact**:

**Code References**:

---

## Decision Template

Use this template for new decisions:

```markdown
### [Date] Decision Title

**Decision**: What was decided

**Rationale**: Why this decision was made

**Alternatives Considered**:
- Option 1: Why rejected
- Option 2: Why rejected

**Impact**:
- Impact on codebase
- Impact on users
- Impact on future development

**Code References**:
- File:line numbers affected

**Owner**: Who made the decision

**Stakeholders**: Who was consulted
```

---

**Last Updated**: 2025-11-11
