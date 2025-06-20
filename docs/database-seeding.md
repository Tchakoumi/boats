# Database Seeding with Faker.js

This document explains how to populate your sailing database with realistic fake data using Faker.js.

## Overview

The seeding system automatically generates realistic boat data including:
- **Boat names**: Creative combinations using adjectives, nouns, locations, and person names
- **Boat types**: Variety of sailing vessels (Sailboat, Catamaran, Yacht, Dinghy, etc.)
- **Years**: Random years between 1970 and current year

## Quick Start

### Docker Environment (Automatic)
When using Docker, seeding happens automatically during container startup:
```bash
docker compose up --build
```
The database will be populated with sample data on first run, but won't duplicate on subsequent restarts.

### Manual Seeding (Local Development)

#### 1. Seed Default Data (50 boats)
```bash
npm run seed
```

#### 2. Seed Custom Number of Boats
```bash
npm run seed:boats 100  # Creates 100 boats
npm run seed:boats 25   # Creates 25 boats
```

#### 3. Force Reseed (Ignores Existing Data)
```bash
npm run seed:force      # Forces 50 boats even if data exists
```

#### 4. View Database Statistics
```bash
npm run seed:stats
```

#### 5. Clear All Boats (Development Only)
```bash
npm run seed:clear
```

## Available Commands

| Command | Description | Example |
|---------|-------------|---------|
| `npm run seed` | Seed 50 boats (idempotent) | `npm run seed` |
| `npm run seed:boats <count>` | Seed specific number of boats | `npm run seed:boats 200` |
| `npm run seed:force` | Force reseed 50 boats (ignores existing) | `npm run seed:force` |
| `npm run seed:clear` | Remove all boats from database | `npm run seed:clear` |
| `npm run seed:stats` | Show database statistics | `npm run seed:stats` |
| `npm run docker:init` | Docker initialization script | `npm run docker:init` |

## Data Generation Details

### Boat Names
The system generates creative boat names using several patterns:
- **Adjective + Noun**: "Swift Navigator", "Bold Explorer"
- **Person's Name**: "Maria's Dream", "Captain John's Pride"
- **Location + Noun**: "Miami Cruiser", "Pacific Wanderer"
- **Company Names**: "Johnson Marine", "Oceanic Adventures"
- **Adjective + Ocean**: "Serene Atlantic", "Majestic Pacific"

### Boat Types
The following sailing vessel types are included:
- Sailboat
- Catamaran
- Yacht
- Dinghy
- Ketch
- Sloop
- Schooner
- Trimaran
- Monohull
- Cruiser
- Racer
- Motor Yacht
- Fishing Boat
- Speedboat

### Years
- **Range**: 1970 to current year
- **Distribution**: Random across the entire range
- **Realistic**: Reflects actual boat manufacturing timeline

## File Structure

```
sailingLoc/
├── src/
│   └── seeders/
│       └── boatSeeder.js          # Core seeding logic
├── scripts/
│   ├── seed.js                    # CLI interface for manual seeding
│   └── docker-init.js             # Docker container initialization
├── docs/
│   └── database-seeding.md        # This documentation
├── docker-compose.yml             # Docker configuration with seeding
└── package.json                   # NPM scripts configuration
```

## Docker Integration

### Automatic Seeding on Container Startup
The seeding system is fully integrated into your Docker workflow:

```yaml
# docker-compose.yml
command: sh -c "node wait-for-mongo.js && node wait-for-elasticsearch.js && npx prisma db push && node scripts/docker-init.js && npm run dev"
```

### Environment Variables for Docker
Control seeding behavior through environment variables:

```yaml
environment:
  - SEED_COUNT=100              # Number of boats to create (default: 50)
  - SKIP_SEEDING=true           # Disable seeding entirely
  - NODE_ENV=development        # Only seeds in development/test environments
```

### Docker Seeding Behavior
- **First Run**: Populates database with sample data
- **Subsequent Runs**: Skips seeding (idempotent behavior)
- **Production**: Automatically disabled
- **Failure Safe**: App starts even if seeding fails

### Controlling Docker Seeding

#### Enable/Disable Seeding
```yaml
# Disable seeding
environment:
  - SKIP_SEEDING=true

# Re-enable seeding (default)
environment:
  # - SKIP_SEEDING=true  # Comment out this line
```

#### Change Seed Count
```yaml
environment:
  - SEED_COUNT=200  # Create 200 boats instead of default 50
```

#### Force Reseed in Docker
To force reseeding in Docker environment:
1. Clear the database: `docker compose exec app npm run seed:clear`
2. Restart container: `docker compose restart app`

## Safety Features

### Idempotent Operation
- **Smart Detection**: Checks if data already exists before seeding
- **No Duplicates**: Won't create duplicate data on container restarts
- **Safe Restarts**: Container can be restarted without data corruption

### Production Protection
- Database clearing is **disabled** in production environment
- Seeding is **automatically disabled** in production
- Prevents accidental data loss

### Batch Processing
- Data insertion happens in batches of 10 for optimal performance
- Progress tracking during large seeding operations

### Graceful Shutdown
- Handles `Ctrl+C` interruption gracefully
- Properly closes database connections
- Non-blocking startup (app starts even if seeding fails)

## Customization

### Adding New Boat Types
Edit `src/seeders/boatSeeder.js` and modify the `BOAT_TYPES` array:

```javascript
const BOAT_TYPES = [
  'Sailboat',
  'Catamaran',
  // Add your custom types here
  'Custom Type 1',
  'Custom Type 2'
];
```

### Modifying Name Generation
Customize the `generateBoatName()` function in `src/seeders/boatSeeder.js`:

```javascript
const generateBoatName = () => {
  const nameTypes = [
    () => `${faker.word.adjective()} ${faker.word.noun()}`,
    () => `Your Custom Pattern Here`,
    // Add more patterns
  ];

  const randomNameType = faker.helpers.arrayElement(nameTypes);
  return randomNameType();
};
```

### Adjusting Year Range
Modify the year generation in the `generateBoat()` function:

```javascript
year: faker.date.between({
  from: new Date('1980-01-01'),  // Change start year
  to: new Date('2020-12-31')     // Change end year
}).getFullYear()
```

## Statistics Output Example

When running `npm run seed:stats`, you'll see output like:

```
📊 BOAT DATABASE STATISTICS
============================
Total boats: 150
Year range: 1972 - 2024

Boats by type:
  Sailboat: 23
  Yacht: 19
  Catamaran: 16
  Cruiser: 14
  Sloop: 12
  ...
```

## Common Use Cases

### Docker Development (Recommended)
```bash
# Start fresh with seeded data
docker compose down --volumes
docker compose up --build

# Check seeded data
docker compose exec app npm run seed:stats

# Add more data to running container
docker compose exec app npm run seed:boats 50
```

### Local Development Setup
```bash
# Fresh database setup
npm run seed:clear
npm run seed:boats 100
npm run seed:stats
```

### Testing Different Scenarios
```bash
# Docker: Small dataset for testing
docker compose down --volumes
# Edit docker-compose.yml: SEED_COUNT=10
docker compose up

# Local: Large dataset for performance testing
npm run seed:boats 1000
```

### Database Maintenance
```bash
# Check current state (works in both Docker and local)
npm run seed:stats  # or: docker compose exec app npm run seed:stats

# Add more data without clearing
npm run seed:boats 50  # or: docker compose exec app npm run seed:boats 50
```

## Troubleshooting

### Database Connection Issues
- Ensure MongoDB is running
- Check your `DATABASE_URL` in environment variables
- Verify Prisma client is properly configured

### Permission Errors
- Ensure your database user has write permissions
- Check that the database exists

### Memory Issues with Large Datasets
- Use smaller batch sizes (modify `batchSize` in `boatSeeder.js`)
- Seed in multiple smaller operations instead of one large operation

## Integration with Your Application

The seeded data works seamlessly with your existing boat API endpoints:

- `GET /api/boats` - Retrieves all seeded boats
- `GET /api/boats/search` - Search through seeded data
- `PUT /api/boats/:id` - Update seeded boats
- `DELETE /api/boats/:id` - Delete seeded boats

This makes it perfect for:
- **Development**: Having realistic data to work with
- **Testing**: Automated tests with consistent data
- **Demos**: Showcasing your application with meaningful content
- **Performance Testing**: Testing with large datasets