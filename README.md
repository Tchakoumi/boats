# SailingLoc - Boat Management API

A modern Express.js application for managing boats with MongoDB and Elasticsearch integration, following best practices and clean architecture.

## 🏗️ Architecture

This application follows Express.js best practices with a clean, modular architecture:

```
src/
├── config/          # Configuration files
│   ├── database.js  # Database connection setup
│   └── environment.js # Environment variables management
├── controllers/     # Request handlers (HTTP layer)
│   ├── boatController.js
│   └── healthController.js
├── middleware/      # Custom middleware
│   ├── errorHandler.js
│   └── validation.js
├── routes/          # Route definitions
│   ├── boats.js
│   ├── health.js
│   └── index.js
├── services/        # Business logic layer
│   ├── boatService.js
│   └── elasticsearchService.js
├── utils/           # Utility functions
│   └── logger.js
├── app.js           # Express app configuration
└── server.js        # Server entry point
```

## 🚀 Quick Start

### With Docker (Recommended)
```bash
git clone https://github.com/EmericBayard/sailingLoc.git
cd sailingLoc
docker compose down --volumes && docker compose up --build
```

### Local Development
```bash
npm install
npm run dev
```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
APP_PORT=3000
NODE_ENV=development
DATABASE_URL="mongodb://username:password@localhost:27017/db_name"
ELASTICSEARCH_URL="http://localhost:9200"
```

## 📁 Project Structure Benefits

- **Separation of Concerns**: Controllers handle HTTP, Services handle business logic
- **Middleware**: Centralized validation and error handling
- **Configuration**: Environment and database configs are isolated
- **Modularity**: Each feature has its own route and controller files
- **Maintainability**: Clean imports and dependencies

## 📚 API Documentation

See [docs/API.md](docs/API.md) for detailed API documentation.

## 🧪 Development

```bash
# Start development server
npm run dev

# Test Elasticsearch connection
npm run test:elasticsearch
```

## 🌱 Database Seeding

Populate your database with realistic fake data using Faker.js:

```bash
# Seed 50 boats (default)
npm run seed

# Seed custom number of boats
npm run seed:boats 100

# View database statistics
npm run seed:stats

# Clear all boats (development only)
npm run seed:clear
```

The seeding system generates realistic boat data including creative names, various boat types (Sailboat, Catamaran, Yacht, etc.), and years from 1970 to present.

📖 **[Full Seeding Documentation](docs/database-seeding.md)**

## 🚢 Features

- RESTful API for boat management
- MongoDB integration with Prisma ORM
- Elasticsearch for advanced search capabilities
- Input validation middleware
- Structured error handling
- Graceful shutdown handling
- Docker support for easy deployment
