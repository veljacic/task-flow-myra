# Task Management System

A full-stack task management application built with modern web technologies, featuring user authentication, task CRUD operations, and real-time updates.

## Architecture Overview

This project consists of two main applications orchestrated with Docker Compose:

- **Task Management Service** - RESTful API backend with authentication and task management
- **Task Management UI** - Modern React frontend with responsive design
- **PostgreSQL Database** - Persistent data storage with automated migrations

## Technology Stack

### Backend Service (`task-management-service`)
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT with refresh tokens
- **Security**: Helmet, CORS, bcrypt
- **Testing**: Jest
- **Code Quality**: ESLint, Prettier

### Frontend Application (`task-management-ui`)
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **State Management**: TanStack React Query + Zustand
- **Routing**: React Router DOM v7
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **Testing**: Vitest with React Testing Library + MSW

### Infrastructure
- **Containerization**: Docker with multi-stage builds
- **Orchestration**: Docker Compose
- **Database**: PostgreSQL 15 Alpine
- **Development**: Hot reload and volume mounting

## Project Structure

```
├── task-management-service/     # Backend API application
│   ├── src/                    # TypeScript source code
│   ├── dist/                   # Compiled JavaScript (production)
│   ├── package.json            # Backend dependencies and scripts
│   ├── Dockerfile              # Production container config
│   └── Dockerfile.dev          # Development container config
├── task-management-ui/         # Frontend React application
│   ├── src/                    # React TypeScript source
│   ├── dist/                   # Built assets (production)
│   ├── package.json            # Frontend dependencies and scripts
|   |-- nginx.conf              # Nginx configuration file
│   ├── Dockerfile              # Production container config
│   └── Dockerfile.dev          # Development container config
├── docker-compose.yml          # Production orchestration
├── docker-compose.dev.yml      # Development orchestration
├── .env                        # Environment variables
└── README.md                   # This file
```

## Quick Start

### Prerequisites
- [Docker](https://www.docker.com/get-started) (v20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2.0+)
- [Node.js](https://nodejs.org/) (v18+) - for local development only

### Development Environment

1. **Start development environment**:

   In the root folder execute the following command:
   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

2. **Access applications**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - Database: localhost:5434


### Production Environment

1. **Configure production environment**:
   ```bash
   # Update .env with production values
   # Ensure strong passwords and secrets
   ```

2. **Deploy with Docker Compose**:
   ```bash
   docker-compose up --build -d
   ```

3. **Access applications**:
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:3000
   - Database: localhost:5435

## Development Commands

CD into the correct directory (`task-management-service` or `task-management-ui`) and execute the commands as you wish.

### Backend Service Commands
```bash
# Development
npm run dev              # Start with nodemon hot reload
npm run build            # Compile TypeScript to JavaScript
npm run start            # Start production server

# Code Quality
npm run lint             # Check code with ESLint
npm run lint:fix         # Auto-fix ESLint issues
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
npm run type-check       # TypeScript type checking
npm run validate         # Run all quality checks + tests

# Testing
npm run test             # Run Jest test suite
npm run test:watch       # Run tests in watch mode

# Database
npm run migrate          # Run Drizzle database migrations
```

### Frontend Application Commands
```bash
# Development
npm run dev              # Start Vite dev server
npm run build            # Build for production
npm run preview          # Preview production build

# Code Quality
npm run lint             # Check code with ESLint
npm run lint:fix         # Auto-fix ESLint issues
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
npm run type-check       # TypeScript type checking
npm run validate         # Run all quality checks + tests

# Testing
npm run test             # Run Vitest test suite
npm run test:watch       # Run tests in watch mode
```

## Docker Usage

### Development Environment
- **Hot reload**: Source code changes reflect immediately
- **Volume mounting**: Local files synchronized with containers
- **Separate database**: Isolated development data on port 5434

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up

# Build and start with forced rebuild
docker-compose -f docker-compose.dev.yml up --build

# Stop services
docker-compose -f docker-compose.dev.yml down

# Clean up (removes volumes)
docker-compose -f docker-compose.dev.yml down -v
```

### Production Environment
- **Optimized builds**: Multi-stage Docker builds for minimal image size
- **Health checks**: Automatic service monitoring and restart
- **Persistent data**: Named volumes for database persistence

```bash
# Deploy production stack
docker-compose up -d
```

## Environment Configuration

### Development Settings
- Database: PostgreSQL on port 5434
- API: http://localhost:3000
- Frontend: http://localhost:5173
- Hot reload enabled for both applications

### Production Settings
- Database: PostgreSQL on port 5435
- API: http://localhost:3000
- Frontend: http://localhost:8080
- Optimized builds with health monitoring

### Required Environment Variables
```bash
# Database Configuration
POSTGRES_DB=task-management-db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-secure-password

# API Configuration
API_PORT=3000
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
DATABASE_URL=postgresql://user:password@database:5432/dbname

# Frontend Configuration
FRONTEND_PORT=8080
VITE_API_URL=http://localhost:3000/api/v1
FRONTEND_URL=http://localhost:8080

# Environment
NODE_ENV=production|development
```

## Testing & Quality Assurance

### Automated Testing
- **Backend**: Jest with Supertest for API integration tests
- **Frontend**: Vitest with React Testing Library for component tests
- **Mocking**: MSW (Mock Service Worker) for API mocking

### Code Quality Tools
- **Linting**: ESLint with TypeScript support
- **Formatting**: Prettier with consistent configuration
- **Type Safety**: TypeScript strict mode enabled
- **Pre-commit**: Validation scripts ensure code quality

### Running Quality Checks
```bash
# Run all quality checks for both applications
cd task-management-service && npm run validate
cd task-management-ui && npm run validate

# Individual checks
npm run lint && npm run type-check && npm run test
```

## Database Management

### PostgreSQL Setup
- **Version**: PostgreSQL 15 Alpine (lightweight)
- **ORM**: Drizzle ORM with TypeScript support
- **Migrations**: Automated schema management
- **Health Checks**: Automatic connection monitoring

### Connection Details
- **Development**: `localhost:5434`
- **Production**: `localhost:5435`
- **Internal**: `database:5432` (container network)

## Security Considerations

- JWT authentication with refresh token rotation
- Password hashing with bcrypt
- CORS configuration for cross-origin requests
- Helmet.js for security headers
- Environment variable isolation
- Database connection pooling

## Monitoring & Health Checks

All services include health check endpoints:
- **Database**: `pg_isready` command
- **API**: `/health` endpoint
- **Frontend**: Nginx health check

## Future Improvements

The following enhancements were considered but not implemented due to time constraints:

### Testing Enhancements
- **Supertest Integration**: Complete route testing with Supertest for all API endpoints
- **OpenAPI Schema Generation**: Automatically generate OpenAPI specs from Zod schemas
- **API Contract Testing**: Integrate OpenAPI specifications into test suites for contract validation

### Out of Scope

While the following would improve the system I considered it outside the scope of this project:

- **OIDC/OAuth Integration**: Using a proper OIDC server or cloud solutions like Clerk for authentication
- **Monorepo Architecture**: Although this would be a good candidate for a monorepo setup (with tools like Nx, Lerna, or pnpm workspaces) for better dependency management and shared code, due to time constraints the applications are built as separate packages

**Note**: The current JWT-based authentication approach was chosen based on the assumption that the organization prefers on-premise solutions over cloud-based identity providers.
