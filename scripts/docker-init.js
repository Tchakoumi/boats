import dotenv from 'dotenv';
import { seedBoats } from '../src/seeders/boatSeeder.js';

// Load environment variables
dotenv.config();

/**
 * Docker Container Initialization Script
 *
 * This script runs during container startup to:
 * 1. Initialize the database with sample data (development only)
 * 2. Skip seeding if data already exists (idempotent)
 * 3. Skip seeding in production environment
 */

async function dockerInit() {
  console.log('🐳 Docker Container Initialization');
  console.log('==================================\n');

  const environment = process.env.NODE_ENV || 'development';
  console.log(`📋 Environment: ${environment}`);

  try {
    // Only seed in development and test environments
    if (environment === 'production') {
      console.log('🚫 Skipping database seeding in production environment');
      return;
    }

    // Get seeding configuration from environment variables
    const seedCount = parseInt(process.env.SEED_COUNT) || 50;
    const skipSeeding = process.env.SKIP_SEEDING === 'true';

    if (skipSeeding) {
      console.log('⏭️  Database seeding disabled by SKIP_SEEDING environment variable');
      return;
    }

    console.log(`🌱 Initializing database with ${seedCount} sample boats...`);

    // Seed database (idempotent - won't create duplicates)
    const result = await seedBoats(seedCount, false);

    if (result.skipped) {
      console.log('✅ Database already initialized with sample data');
    } else {
      console.log(`✅ Database initialization complete! Created ${result.created} boats`);
    }

  } catch (error) {
    console.error('❌ Docker initialization failed:', error.message);
    // Don't exit with error - allow the app to start even if seeding fails
    console.log('⚠️  Continuing with application startup...');
  }

  console.log('🚀 Ready to start application\n');
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Initialization interrupted');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Initialization terminated');
  process.exit(0);
});

dockerInit();