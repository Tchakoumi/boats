# AI Project Overview: SailingLoc

## Project Summary
**SailingLoc** is a modern boat management API built with Express.js, MongoDB, and Elasticsearch. It provides RESTful endpoints for managing boat data with advanced search capabilities. The project follows clean architecture principles with proper separation of concerns.

## 🎯 Core Purpose
- **Primary Function**: Manage boat inventory/database with CRUD operations
- **Search Capability**: Advanced boat search using Elasticsearch with filters
- **Integration**: Dual database approach (MongoDB for persistence, Elasticsearch for search)
- **Deployment**: Containerized with Docker for easy development and deployment

## 🏗️ Architecture Overview

### Technology Stack
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Primary Database**: MongoDB with Prisma ORM
- **Search Engine**: Elasticsearch 8.11.0
- **Container**: Docker with docker-compose
- **Development**: Nodemon for hot reloading

### Key Architecture Patterns
1. **Layered Architecture**: Controllers → Services → Database
2. **Separation of Concerns**: HTTP handling separate from business logic
3. **Middleware Pattern**: Centralized validation and error handling
4. **Configuration Management**: Environment-based config
5. **Health Checks**: Both application and Elasticsearch health endpoints

## 📁 Project Structure

```
sailingLoc/
├── src/
│   ├── config/          # Database and environment configuration
│   ├── controllers/     # HTTP request handlers
│   │   ├── boatController.js     # Boat CRUD operations
│   │   └── healthController.js   # Health check endpoints
│   ├── middleware/      # Custom middleware (validation, error handling)
│   ├── routes/          # Express route definitions
│   ├── services/        # Business logic layer
│   │   ├── boatService.js          # Boat business logic
│   │   └── elasticsearchService.js # Search functionality
│   ├── utils/           # Utility functions (logging, etc.)
│   ├── app.js           # Express app setup
│   └── server.js        # Server entry point
├── docs/                # Human-readable documentation
│   └── API.md          # API endpoint documentation
├── AI/                  # AI assistant documentation
│   └── PROJECT_OVERVIEW.md # This file
├── prisma/              # Database schema and migrations
├── docker-compose.yml   # Multi-container Docker setup
├── package.json         # Dependencies and scripts
└── README.md           # Main project documentation
```

## 🔧 Infrastructure Setup

### Docker Services
1. **MongoDB (Port 27018)**: Primary database with replica set
2. **Elasticsearch (Port 9200)**: Search engine for boat queries
3. **Express App (Port 3000)**: Main API application

### Environment Variables
- `DATABASE_URL`: MongoDB connection string
- `ELASTICSEARCH_URL`: Elasticsearch connection URL
- `NODE_ENV`: Environment (development/production)
- `APP_PORT`: Application port (default: 3000)

## 🔍 Key Implementation Details

### Data Flow
1. **Create/Update**: Data goes to MongoDB via Prisma → Synchronized to Elasticsearch
2. **Search**: Complex queries use Elasticsearch directly
3. **Simple CRUD**: MongoDB via Prisma for basic operations

### Key Files to Understand
- `src/controllers/boatController.js`: HTTP layer for boat operations
- `src/services/boatService.js`: Business logic for boat management
- `src/services/elasticsearchService.js`: Search implementation with filters
- `docker-compose.yml`: Infrastructure setup
- `wait-for-*.js`: Startup orchestration scripts

### API Endpoints Overview
- `GET /boats` - List all boats
- `POST /boats` - Create new boat
- `PUT /boats/:id` - Update boat
- `DELETE /boats/:id` - Delete boat
- `GET /boats/search` - Advanced search with filters
- `GET /` - Health check
- `GET /elasticsearch/health` - Elasticsearch health

## 🚀 Development Workflow

### Quick Start Commands
```bash
# Full stack with Docker (recommended)
docker compose down --volumes && docker compose up --build

# Local development
npm install && npm run dev

# Test Elasticsearch connection
npm run test:elasticsearch
```

### Development Features
- Hot reloading with nodemon
- Automatic database migration on startup
- Health checks for all services
- Volume mounting for live code changes

## 🧠 AI Assistant Guidelines

### When Working on This Project:

#### Understanding Context
- This is a **boat management system** - all features revolve around boat inventory
- **Dual database approach**: MongoDB for persistence, Elasticsearch for search
- **Clean architecture**: Always respect the controller → service → database layer pattern

#### Making Changes
1. **Controllers**: Only handle HTTP requests/responses, delegate to services
2. **Services**: Contain business logic, coordinate between databases
3. **Database changes**: May require both MongoDB (Prisma) and Elasticsearch updates
4. **New features**: Follow existing patterns in boatController/boatService

#### Common Tasks
- **Adding boat properties**: Update Prisma schema + Elasticsearch mapping
- **New search filters**: Modify elasticsearchService.js
- **API endpoints**: Add to routes, controller, and service layers
- **Database queries**: Use Prisma for MongoDB, direct client for Elasticsearch

#### Testing & Deployment
- Always test with Docker Compose for full integration
- Check both health endpoints after changes
- Elasticsearch may need index recreation for schema changes

### Key Considerations
- **Data Consistency**: Keep MongoDB and Elasticsearch in sync
- **Error Handling**: Use structured error responses
- **Environment**: Support both development and production configurations
- **Performance**: Elasticsearch for search, MongoDB for transactional operations

## 📚 Related Documentation
- **API Details**: See `docs/API.md` for endpoint specifications
- **User Guide**: See `README.md` for setup and usage instructions
- **Code Examples**: Check existing controller and service implementations

This documentation should provide sufficient context for AI assistants to understand the project structure, make informed changes, and maintain consistency with the existing architecture patterns.