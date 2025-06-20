import dotenv from 'dotenv';
import { seedBoats, clearBoats, showBoatStats } from '../src/seeders/boatSeeder.js';

// Load environment variables
dotenv.config();

/**
 * Database Seeding Script
 *
 * Usage:
 *   npm run seed              # Seed 50 boats
 *   npm run seed:boats 100    # Seed 100 boats
 *   npm run seed:clear        # Clear all boats
 *   npm run seed:stats        # Show database statistics
 */

const args = process.argv.slice(2);
const command = args[0];
const count = parseInt(args[1]) || 50;
const force = args.includes('--force');

async function main() {
  console.log('🌱 Database Seeding Tool');
  console.log('========================\n');

  try {
        switch (command) {
      case 'boats':
        await seedBoats(count, force);
        break;

      case 'clear':
        const confirmation = process.env.NODE_ENV === 'production'
          ? false
          : true; // Prevent accidental clearing in production

        if (!confirmation && process.env.NODE_ENV === 'production') {
          console.log('❌ Clearing database is disabled in production environment');
          process.exit(1);
        }

        await clearBoats();
        break;

      case 'stats':
        await showBoatStats();
        break;

      default:
        // Default: seed boats
        await seedBoats(count, force);
        break;
    }
  } catch (error) {
    console.error('💥 Seeding failed:', error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Seeding interrupted by user');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Seeding terminated');
  process.exit(0);
});

main();