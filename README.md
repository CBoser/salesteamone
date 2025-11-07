# MindFlow - Construction Management Platform

A full-stack construction management platform built with modern web technologies. MindFlow helps construction companies manage multiple builders, housing projects, pricing, materials, and bidding processes.

## Tech Stack

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **React Router** - Client-side routing

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web application framework
- **TypeScript** - Type-safe server code
- **PostgreSQL** - Relational database
- **Prisma** - Modern ORM

### Deployment
- **Frontend**: Vercel
- **Backend**: Railway
- **Database**: Railway PostgreSQL

## Project Structure

```
salesteamone/
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service layer
│   │   ├── hooks/         # Custom React hooks
│   │   ├── types/         # Frontend-specific types
│   │   ├── utils/         # Utility functions
│   │   └── App.tsx        # Main app component
│   ├── public/            # Static assets
│   └── package.json
│
├── backend/               # Express backend API
│   ├── src/
│   │   ├── routes/        # API route definitions
│   │   ├── controllers/   # Route controllers
│   │   ├── services/      # Business logic layer
│   │   ├── middleware/    # Express middleware
│   │   ├── types/         # Backend-specific types
│   │   └── index.ts       # Server entry point
│   ├── prisma/
│   │   └── schema.prisma  # Database schema
│   └── package.json
│
├── shared/                # Shared code between frontend & backend
│   └── types/             # Shared TypeScript interfaces
│
├── legacy/                # Original static HTML application
│
└── package.json           # Root package scripts
```

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** 14+ (for production database)
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/CBoser/salesteamone.git
   cd salesteamone
   ```

2. **Install dependencies**
   ```bash
   # Install all dependencies (frontend + backend)
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the `backend` directory:
   ```env
   PORT=3001
   NODE_ENV=development
   DATABASE_URL="postgresql://user:password@localhost:5432/mindflow?schema=public"
   FRONTEND_URL=http://localhost:5173
   ```

4. **Set up the database**
   ```bash
   cd backend
   npm run prisma:migrate
   npm run prisma:generate
   cd ..
   ```

### Development

**Start both frontend and backend servers:**
```bash
npm run dev
```

This will start:
- Frontend at http://localhost:5173
- Backend at http://localhost:3001

**Or run them separately:**
```bash
# Terminal 1 - Frontend
npm run dev:frontend

# Terminal 2 - Backend
npm run dev:backend
```

### Testing

**Health check the API:**
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "MindFlow API is running",
  "timestamp": "2025-11-07T12:00:00.000Z"
}
```

### Building for Production

**Build both frontend and backend:**
```bash
npm run build
```

**Or build separately:**
```bash
npm run build:frontend
npm run build:backend
```

## Available Scripts

### Root Level
- `npm run dev` - Run both frontend and backend in development mode
- `npm run dev:frontend` - Run only frontend dev server
- `npm run dev:backend` - Run only backend dev server
- `npm run build` - Build both frontend and backend for production
- `npm run build:frontend` - Build frontend only
- `npm run build:backend` - Build backend only

### Frontend (in /frontend directory)
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend (in /backend directory)
- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm run start` - Run compiled production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio GUI

## Features

### Core Functionality
- Multi-builder support with isolated data sets
- Plan library management with detailed specifications
- Pricing management with margins and calculations
- Options & upgrades catalog
- Community requirements tracking
- Pack definitions with scheduling
- Material database with vendor costs

### Calculators
- Pony Wall Calculator
- Fencing Calculator
- Deck Calculator
- Stairs & Landing Calculator

### Reports & Analytics
- Margin analysis
- Pricing summaries
- Plan comparisons
- Options pricing reports

## API Endpoints

### Health Check
```
GET /health
```
Returns API health status.

### Core Endpoints (Coming Soon)
```
GET    /api/plans          - Get all plans
POST   /api/plans          - Create new plan
GET    /api/plans/:id      - Get plan by ID
PUT    /api/plans/:id      - Update plan
DELETE /api/plans/:id      - Delete plan

GET    /api/materials      - Get all materials
POST   /api/materials      - Create material
...
```

## Database Schema

The Prisma schema defines the following main models:
- **User** - User accounts and authentication
- **Project** - Construction projects
- **Plan** - Floor plans (to be added)
- **Material** - Material database (to be added)
- **Pricing** - Pricing items (to be added)
- **Community** - Communities (to be added)
- **Pack** - Pack definitions (to be added)
- **Option** - Options and upgrades (to be added)

## Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set build command: `cd frontend && npm run build`
3. Set output directory: `frontend/dist`
4. Add environment variables as needed

### Backend (Railway)
1. Create a new project on Railway
2. Add PostgreSQL database
3. Connect your GitHub repository
4. Set build command: `cd backend && npm run build`
5. Set start command: `cd backend && npm run start`
6. Add environment variables from `.env`

## Migration from Legacy

The original static HTML application has been moved to the `/legacy` folder. To migrate data:

1. Export data from the legacy app (localStorage to CSV)
2. Transform data format to match new schema
3. Import via API endpoints or database seeding

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

Copyright 2025 - All rights reserved

## Support

For issues, questions, or feature requests:
- Create an issue on GitHub
- Contact the development team

---

Built with dedication for the construction industry. Helping builders bid smarter.
