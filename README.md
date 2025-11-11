# MindFlow Platform
**Modern Construction Management for Production Builders**

A comprehensive full-stack platform designed to transform fragile Excel-based institutional knowledge into a scalable, intelligent construction management system. MindFlow serves as the essential "Rosetta Stone" for construction data—translating between disparate builder systems while preserving hard-won operational expertise.

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose
- Git

### Launch the Platform

```bash
# One-time setup
./scripts/setup.sh          # Install dependencies and create config files

# Start the application
./scripts/launch.sh         # Starts database and launches app

# Stop the application
./scripts/stop.sh           # Stops all services
```

**Manual Launch:**
```bash
docker-compose up -d                    # Start PostgreSQL
cd backend && npm run prisma:migrate    # Initialize database
npm run dev                             # Launch frontend + backend
```

Access the app at **http://localhost:5173**

For detailed instructions, see [LAUNCH_GUIDE.md](./docs/LAUNCH_GUIDE.md)

---

## Vision

**The Problem:** Production builders manage billions in material commitments using 70+ interconnected Excel spreadsheets. This "tribal knowledge" is powerful but fragile, opaque, and impossible to scale. When estimators retire, decades of pricing expertise walks out the door.

**The Solution:** MindFlow performs an act of translation—converting institutional knowledge from an executable format (Excel formulas) into a declarative format (database structures + transparent business logic). This preserves expertise, enables scale, and creates a corporate asset that grows smarter with every project.

**Market Opportunity:** 18-24 month competitive window. No existing platform delivers MindFlow's combination of:
- Normalized metadata schema
- Declarative validation engine
- Transparent business logic (pedagogical architecture)
- Multi-builder flexibility with bidirectional mapping

---

## Core Philosophy

### 1. Translation, Not Replacement
MindFlow doesn't force builders to abandon their systems. It acts as an intelligent translation layer that preserves external system identifiers while maintaining a unified internal schema.

### 2. Transparent Business Logic
Unlike "black box" competitors, every calculation is inspectable and explainable. A $2,547 material cost shows the complete breakdown:
- Base vendor cost: $2,100
- Commodity adjustment: +$175 (RL index +15%)
- Customer tier discount: -$150 (Tier 2: -7%)
- Applied margin: +$422 (20% markup)

This transparency builds trust, enables training, and facilitates auditing.

### 3. Universal Truths vs. Contextual Variations
The platform separates immutable domain facts (database structure) from changeable business rules (configuration tables). Core logic is protected and stable; business rules evolve via data, not code changes.

### 4. Learning Loops
The system continuously improves. Variance analysis feeds back into plan templates. Historical performance refines future estimates. Each job makes the platform smarter.

---

## Platform Architecture

### Four-Layer System Design

```
┌─────────────────────────────────────────────────────┐
│ INTELLIGENCE LAYER                                   │
│ Communications Hub | Reporting & Analytics          │
│ (Learn and inform)                                   │
└─────────────────────────────────────────────────────┘
                        ↑
┌─────────────────────────────────────────────────────┐
│ TRANSACTION LAYER                                    │
│ Purchase Orders | Order Calendar & Scheduling       │
│ (Execute commitments)                                │
└─────────────────────────────────────────────────────┘
                        ↑
┌─────────────────────────────────────────────────────┐
│ OPERATIONAL CORE                                     │
│ Communities/Lots | Job Management | Takeoffs         │
│ (Transform plans into projects)                      │
└─────────────────────────────────────────────────────┘
                        ↑
┌─────────────────────────────────────────────────────┐
│ FOUNDATION LAYER                                     │
│ Customers | Plans | Materials & Pricing             │
│ (Single source of truth)                             │
└─────────────────────────────────────────────────────┘
```

**Foundation Layer** - Core business data (customers, plans, pricing)
**Operational Core** - Active construction projects (jobs, takeoffs, validation)
**Transaction Layer** - Financial and temporal commitments (POs, scheduling)
**Intelligence Layer** - Communication and continuous improvement (analytics, insights)

---

## Key Features

### Foundation Layer

**Customer Database**
- Multi-tier pricing management (Tier 1, Tier 2, Volume discounts)
- Contact management with notification preferences
- External system mapping (Sales 1440, Hyphen BuildPro, Holt Portal)
- Historical project relationships

**Plans Management**
- Complete blueprint library with version control
- Dual representation: human-readable names + machine-queryable components
- Elevation management (A/B/C/D facade variations)
- Options catalog (upgrades, modifications)
- PDSS (Plan Design & Specification Sheet) document storage
- Intelligent plan name parsing ("2400BDE-RIV" → Plan: 2400, Options: B/D/E, Subdivision: RIV)

**Materials & Pricing**
- Transparent pricing pipeline (every calculation step visible)
- Commodity pricing integration (Random Lengths, real-time lumber pricing)
- Customer-specific pricing tiers
- MBF (thousand board feet) calculations for lumber
- Length adders and grade multipliers
- Material-to-vendor relationships

### Operational Core

**Communities & Lots Management**
- Subdivision tracking with community-specific rules
- Lot inventory and status management
- Plan compatibility enforcement

**Order Creation & Job Management**
- Single-entry job creation (customer + plan + lot → instant estimate)
- Status workflow tracking (draft → estimated → approved → in progress → completed)
- Automated cost estimation with margin calculation
- Job folder creation and document management

**Plan Takeoffs & Validation**
- Automated bill of materials generation from plan templates
- Multi-stage validation:
  - Specification compliance
  - Pricing currency (flags stale costs)
  - Historical variance comparison
- Variance tracking (estimated vs. actual materials)
- Learning recommendations for template improvement

### Transaction Layer

**Purchase Order Management**
- PO lifecycle tracking (draft → approved → sent → confirmed → delivered)
- Vendor coordination and delivery tracking
- External system integration (Hyphen BuildPro, Holt Portal)
- Signature capture and photo documentation

**Order Calendar & Scheduling**
- Master timeline for all jobs and deliveries
- Conflict detection (prevent overlapping deliveries)
- Late delivery alerts
- Prideboard (digital task management)
- Dependency tracking

### Intelligence Layer

**Communications Hub**
- Centralized project communications
- Automated notifications (job created, PO approved, delivery scheduled)
- Searchable conversation archive
- Multi-channel support (email, SMS, in-app)

**Reporting & Analytics**
- Variance analysis (estimated vs. actual by material, job, customer)
- Margin reports (profitability by job, plan, customer)
- Cycle time analytics (identify bottlenecks)
- Waste and theft tracking
- Learning recommendations (automatic insight generation)

---

## Technology Stack

### Frontend
- React 18 with TypeScript
- Vite (build tool)
- TailwindCSS (styling)
- Recharts (data visualization)
- React Query (caching and state management)

### Backend
- Node.js 20 LTS
- Express.js (REST API)
- PostgreSQL 15 (database)
- Prisma ORM
- JWT authentication

### Infrastructure
- Vercel (frontend hosting)
- Railway (backend + database)
- AWS S3 (document storage)
- Cloudflare CDN

### Mobile
- React Native with Expo

---

## Project Structure

```
ConstructionPlatform/
├── README.md                # This file
├── package.json             # Monorepo root package
├── docker-compose.yml       # Local PostgreSQL setup
│
├── frontend/                # React application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── ui/         # Base components (Button, Modal, Table)
│   │   │   ├── customers/  # Customer-specific components
│   │   │   ├── plans/      # Plan-specific components
│   │   │   └── materials/  # Material-specific components
│   │   ├── pages/          # Top-level page components
│   │   │   ├── customers/  # Customer management pages
│   │   │   ├── plans/      # Plan management pages
│   │   │   ├── materials/  # Material management pages
│   │   │   ├── jobs/       # Job management pages
│   │   │   └── reports/    # Reporting pages
│   │   ├── services/       # API client services
│   │   ├── hooks/          # Custom React hooks
│   │   ├── contexts/       # React contexts (Auth, Theme)
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Helper functions
│   ├── public/             # Static assets
│   └── package.json
│
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── routes/         # API route definitions
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic
│   │   │   ├── CustomerService.ts
│   │   │   ├── PlanService.ts
│   │   │   ├── MaterialService.ts
│   │   │   ├── PricingPipelineService.ts
│   │   │   └── PlanNameParser.ts
│   │   ├── repositories/   # Data access layer
│   │   ├── middleware/     # Express middleware (security, CORS, rate limiting)
│   │   ├── validators/     # Input validation (Zod)
│   │   └── errors/         # Custom error classes
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   ├── migrations/     # Database migrations
│   │   └── seeds/          # Seed data
│   └── package.json
│
├── shared/                  # Shared TypeScript types
│   └── types/
│       ├── customer.ts
│       ├── plan.ts
│       ├── material.ts
│       └── pricing.ts
│
├── docs/                    # Project documentation
│   ├── DAILY_WORKFLOW.md    # Daily development workflow
│   ├── CHANGELOG.md         # Project changelog
│   ├── LAUNCH_GUIDE.md      # Detailed setup instructions
│   ├── QUICK_START.md       # Quick reference guide
│   ├── SPRINT_PLAN.md       # Master sprint plan
│   ├── sprints/             # Sprint-specific documentation
│   │   └── sprint-01/       # Current sprint
│   │       ├── PLAN.md      # Sprint plan with daily objectives
│   │       ├── PROGRESS.md  # Daily progress tracking
│   │       └── DECISIONS.md # Technical decisions log
│   ├── time-tracking/       # Time logs by week
│   ├── technical-debt/      # Technical debt register
│   └── archive/             # Archived documentation
│
├── scripts/                 # DevOps and automation scripts
│   ├── launch.sh            # Start the application
│   ├── launch-dev.sh        # Development mode launch
│   ├── setup.sh             # Initial setup script
│   ├── stop.sh              # Stop all services
│   └── devops.py            # Python DevOps management tool
│
└── archive/                 # Historical artifacts
    ├── legacy/              # Old HTML/CSS/JS (pre-React)
    ├── snapshots/           # Folder tree snapshots
    └── status-checks/       # Historical status checks
```

---

## Getting Started

### Prerequisites

- Node.js 20+ and npm
- Docker (for local PostgreSQL)
- Git

### Installation

#### Option 1: Automated Setup (Recommended)

The easiest way to set up the project:

```bash
# Run the automated setup script
./scripts/setup.sh
```

This will:
- Check prerequisites (Node.js, Docker)
- Create .env files from templates
- Install all dependencies
- Clean old database volumes
- Start PostgreSQL
- Run database migrations

#### Option 2: DevOps Tool (Python - Cross-Platform)

Use the DevOps management tool for interactive setup and management:

```bash
# Launch the DevOps tool
python3 scripts/devops.py
```

The DevOps tool provides an interactive menu for:
- Database management (start, stop, reset, migrations)
- Dependency installation (frontend, backend)
- Development server control
- Project tree generation
- System diagnostics and health checks

See [docs/DEVOPS_TOOL.md](./docs/DEVOPS_TOOL.md) for detailed usage.

#### Option 3: Manual Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/mindflow.git
   cd mindflow
   ```

2. **Set up environment variables:**
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   # Edit .env files with your configuration
   ```

3. **Start PostgreSQL:**
   ```bash
   docker-compose up -d
   ```

4. **Install dependencies:**
   ```bash
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   ```

5. **Run database migrations:**
   ```bash
   cd backend
   npm run prisma:generate
   npm run prisma:migrate
   ```

6. **Seed initial data:**
   ```bash
   npm run prisma:seed
   ```

7. **Start development servers:**
   ```bash
   npm run dev
   ```

   This starts:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3001
   - Prisma Studio: http://localhost:5555

### First Steps

1. **Login** with seeded admin account (see seed data)
2. **Explore the dashboard** - see platform overview
3. **Add a customer** - Foundation → Customers → Add New
4. **Import plans** - Foundation → Plans → Add Plan
5. **Configure materials** - Foundation → Materials → Add Material
6. **Create your first job** - Operations → Jobs → Create Job

---

## Development Roadmap

### Phase 1: Foundation Layer ✅ (Months 1-4)
- Customer Database with pricing tiers
- Plans Management with version control
- Materials & Pricing with transparent pipeline

### Phase 2: Operational Core 🔄 (Months 5-9)
- Communities & Lots Management
- Order Creation & Job Management
- Plan Takeoffs & Validation

### Phase 3: Transaction Layer 📋 (Months 10-13)
- Purchase Order Management
- Order Calendar & Scheduling

### Phase 4: Intelligence Layer 📋 (Months 14-16)
- Communications Hub
- Reporting & Analytics

### Phase 5: Integration & Polish 📋 (Months 17-18)
- External system connectors (Hyphen, Holt, Sales 1440)
- Performance optimization
- Production launch

**Total Timeline:** 18 months (Q4 2024 - Q1 2026)

---

## Target Users

### Primary (65%)
**Production Builders** - 500+ homes/year
- Need: Scale, automation, institutional knowledge preservation
- Examples: Richmond American, Holt Homes

### Secondary (25%)
**Semi-Custom Builders** - 100-500 homes/year
- Need: Professional systems without enterprise complexity
- Examples: Regional custom builders expanding operations

### Tertiary (10%)
**Full Custom Builders** - High-value individual projects
- Need: Detailed pricing transparency, client communication

---

## Competitive Advantage

**vs. Excel/BAT Systems:**
- Scalable, maintainable, reduces error rate from 2-3% to <0.5%
- Preserves institutional knowledge (doesn't walk out door with retirees)
- Enables analytics and continuous improvement

**vs. Enterprise ERPs (SAP, Oracle):**
- Built specifically for construction domain
- Plan-native data model (not generic "custom fields")
- Fraction of implementation cost

**vs. SMB Tools (Buildertrend, CoConstruct):**
- Deep pricing intelligence and business logic
- Multi-builder workflows
- Transparent calculations (pedagogical architecture)

**vs. Competitors (Hyphen, Procore):**
- Essential metadata + rules layer that connects ecosystems
- Bidirectional translation (doesn't force migration)
- 18-24 month lead in normalized schema + declarative validation

---

## Key Integrations

### Current
- **Hyphen BuildPro** (Richmond American) - Job sync, PO sync
- **Holt Builder Portal** - Delivery confirmation sync
- **Sales 1440** - Customer and plan import

### Planned
- Procore integration
- BuilderTrend integration
- QuickBooks/Xero accounting
- Random Lengths commodity pricing API

---

## Data Security

- **Authentication:** JWT tokens with role-based access control
- **Authorization:** Granular permissions (Admin, Estimator, PM, Field User)
- **Encryption:**
  - At rest: Database-level encryption
  - In transit: TLS 1.3
- **Audit Logging:** Every action tracked with user, timestamp, changes
- **Backup:** Automated daily backups with point-in-time recovery
- **Compliance:** SOC 2 Type II compliant (planned)

---

## API Documentation

API documentation available at:
- Development: http://localhost:3001/api-docs
- Production: https://api.mindflow.com/docs

### Key Endpoints

**Foundation Layer:**
```
GET    /api/v1/customers
POST   /api/v1/customers
GET    /api/v1/plans
POST   /api/v1/plans/translate
POST   /api/v1/pricing/calculate
```

**Operational Core:**
```
POST   /api/v1/jobs
PUT    /api/v1/takeoffs/:id/validate
```

**Transaction Layer:**
```
POST   /api/v1/purchase-orders
POST   /api/v1/schedule/conflicts
```

**Intelligence Layer:**
```
GET    /api/v1/reports/:reportId
GET    /api/v1/analytics/variance
```

---

## Testing

### Run Tests
```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

### Test Data
Seed data includes:
- 2 sample customers (RICHMOND, HOLT)
- 40 Richmond plans with elevations
- 20+ materials with pricing rules
- Historical commodity pricing data

---

## Deployment

### Production Deployment

1. **Build frontend:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Vercel:**
   ```bash
   vercel --prod
   ```

3. **Deploy backend to Railway:**
   ```bash
   railway up
   ```

4. **Run production migrations:**
   ```bash
   npm run prisma:migrate:prod
   ```

### Environment Variables

**Frontend (.env):**
```
VITE_API_URL=https://api.mindflow.com
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
```

**Backend (.env):**
```
DATABASE_URL=postgresql://user:password@host:5432/mindflow
JWT_SECRET=your-secret-key
AWS_S3_BUCKET=mindflow-documents
SENDGRID_API_KEY=your-sendgrid-key
```

---

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Standards

- **TypeScript:** Strict mode enabled, no `any` types
- **Testing:** All new features require tests (80%+ coverage)
- **Code Style:** ESLint + Prettier configured
- **Commits:** Conventional commit format (`feat:`, `fix:`, `docs:`)
- **Documentation:** Update README and API docs with changes

---

## Troubleshooting

### Quick Diagnostic Tool

**Before troubleshooting manually, use the DevOps tool:**

```bash
# Launch the DevOps tool
python3 scripts/devops.py
```

The DevOps tool provides:
- Interactive menu for common tasks
- System diagnostics and health checks
- Database management (start, stop, reset)
- Dependency installation
- Development server control
- Project tree generation

See [docs/DEVOPS_TOOL.md](./docs/DEVOPS_TOOL.md) for detailed troubleshooting guides.

### Database Connection Issues
```bash
# Check PostgreSQL is running
docker ps

# Restart PostgreSQL
docker-compose restart

# View logs
docker-compose logs postgres
```

### Database Authentication Errors

**Problem:** Prisma migrations fail with "Authentication failed against database server" or "provided database credentials are not valid" error.

**Cause:** An old PostgreSQL Docker volume exists with different credentials than the current `.env` file.

**Solution (Windows):**
```powershell
# Use the database reset script (recommended)
.\db-reset.bat

# OR manually:
docker compose down
docker volume rm constructionplatform_postgres_data
docker compose up -d
# Wait 15 seconds for database to initialize
cd backend
npm run prisma:generate
npm run prisma:migrate
```

**Solution (Linux/Mac):**
```bash
# Stop and remove old database
docker compose down
docker volume rm constructionplatform_postgres_data

# Start fresh database
docker compose up -d
sleep 15  # Wait for database to initialize

# Run migrations
cd backend
npm run prisma:generate
npm run prisma:migrate
```

**Note:** The `setup.bat` script now automatically cleans old volumes, so this issue should only occur if you had previously set up the database with different credentials.

### Frontend Not Loading
```bash
# Clear cache and rebuild
rm -rf node_modules frontend/dist
npm install
npm run dev
```

### Windows-Specific: npm install Failures

**Problem:** npm install fails with `EBUSY: resource busy or locked` or `EPERM: operation not permitted` errors on Windows.

**Common Causes:**
- Files locked by IDEs (VS Code, WebStorm, etc.)
- Development servers still running
- Windows Defender or antivirus scanning
- Insufficient permissions

**Solutions:**

1. **Close all development processes:**
   ```powershell
   # Stop any running dev servers (Ctrl+C in terminals)
   # Close your IDE/editor
   # Wait 10 seconds for file handles to release
   ```

2. **Delete node_modules and try again:**
   ```powershell
   # In PowerShell, navigate to frontend directory
   cd frontend
   Remove-Item -Recurse -Force node_modules
   npm install
   ```

3. **Run as Administrator (if permission errors persist):**
   - Right-click on PowerShell/Command Prompt
   - Select "Run as Administrator"
   - Navigate to project and retry `npm install`

4. **Temporarily disable Windows Defender real-time scanning:**
   - Open Windows Security
   - Virus & threat protection → Manage settings
   - Turn off Real-time protection temporarily
   - Run `npm install`
   - Re-enable protection after installation

5. **Clear npm cache:**
   ```powershell
   npm cache clean --force
   npm install
   ```

**Note:** The project now includes patch-package as a dependency and an .npmrc file with Windows-optimized settings to minimize these issues.

### API Errors
```bash
# Check backend logs
npm run dev:backend

# Verify environment variables
cat .env

# Test database connection
npm run prisma:studio
```

---

## Performance Benchmarks

**Target Metrics:**
- Page load time: <2 seconds
- API response time: <200ms (p95)
- Search results: <500ms
- Concurrent users: 50+
- Database queries: <100ms (p95)

**Optimization Strategies:**
- React Query caching (reduce API calls by 70%)
- Database indexing on foreign keys and search fields
- Lazy loading for large datasets
- Image optimization and CDN delivery
- Prisma connection pooling

---

## Support & Resources

**Documentation:**
- [User Guide](https://docs.mindflow.com/user-guide)
- [API Reference](https://docs.mindflow.com/api)
- [Architecture Overview](https://docs.mindflow.com/architecture)

**Community:**
- GitHub Discussions
- Discord Server
- Monthly Office Hours

**Commercial Support:**
- Email: support@mindflow.com
- Priority Support SLA available
- Custom training and onboarding

---

## Success Metrics

**Business Impact (500-home/year builder):**
- 80% reduction in manual data entry
- $250K+ annual savings (reduced errors, improved efficiency)
- 0.5% margin improvement through better visibility
- 50% reduction in estimator onboarding time

**User Adoption:**
- 90%+ daily active users
- <5% still using Excel for primary workflows
- 4.5+ star average user satisfaction

**Technical Performance:**
- 99.5% uptime SLA
- <2 second average page load
- Zero critical security vulnerabilities

---

## License

Copyright © 2025 MindFlow Platform. All rights reserved.

Proprietary software. Unauthorized copying, modification, or distribution is prohibited.

For licensing inquiries: licensing@mindflow.com

---

## Acknowledgments

Built with dedication for the construction industry. Special thanks to:
- Richmond American for domain expertise and pilot partnership
- Holt Homes for integration testing and feedback
- Early adopters who trusted the vision

**Mission:** Transform fragile spreadsheets into durable corporate assets that preserve institutional knowledge and enable sustainable growth.

---

**Status:** Phase 1 Complete | Phase 2 In Progress
**Version:** 0.5.0 (Beta)
**Last Updated:** December 2024

Built with ❤️ for builders who build with precision.
