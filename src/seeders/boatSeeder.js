import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';
import elasticsearchService from '../services/elasticsearchService.js';

const prisma = new PrismaClient();

/**
 * Boat types commonly used in sailing
 */
const BOAT_TYPES = [
  'Sailboat',
  'Catamaran',
  'Yacht',
  'Dinghy',
  'Ketch',
  'Sloop',
  'Schooner',
  'Trimaran',
  'Monohull',
  'Cruiser',
  'Racer',
  'Motor Yacht',
  'Fishing Boat',
  'Speedboat'
];

/**
 * Generate realistic boat names using faker
 */
const generateBoatName = () => {
  // Sailing-themed words for more realistic boat names
  const sailingAdjectives = ['Swift', 'Bold', 'Serene', 'Majestic', 'Ocean', 'Sea', 'Wind', 'Storm', 'Calm', 'Deep'];
  const sailingNouns = ['Navigator', 'Explorer', 'Wanderer', 'Cruiser', 'Dream', 'Spirit', 'Breeze', 'Wave', 'Tide', 'Star'];
  const waterBodies = ['Atlantic', 'Pacific', 'Mediterranean', 'Caribbean', 'Arctic', 'Baltic', 'Aegean'];

    const nameTypes = [
    () => `${faker.helpers.arrayElement(sailingAdjectives)} ${faker.helpers.arrayElement(sailingNouns)}`,
    () => `${faker.person.firstName()} ${faker.helpers.arrayElement(sailingNouns)}`, // Removed apostrophe
    () => `${faker.location.city()} ${faker.helpers.arrayElement(sailingNouns)}`,
    () => `${faker.helpers.arrayElement(sailingNouns)} ${faker.helpers.arrayElement(sailingNouns)}`,
    () => `${faker.person.lastName()} ${faker.helpers.arrayElement(sailingNouns)}`, // Simpler alternative
    () => `${faker.helpers.arrayElement(sailingAdjectives)} ${faker.helpers.arrayElement(waterBodies)}`,
    () => `${faker.helpers.arrayElement(sailingAdjectives)} ${faker.helpers.arrayElement(sailingNouns)}`,
  ];

  const randomNameType = faker.helpers.arrayElement(nameTypes);
  const name = randomNameType();

  // Clean up name: remove special characters that might cause database issues
  return name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
};

/**
 * Generate a single boat with realistic data
 */
const generateBoat = () => {
  return {
    name: generateBoatName(),
    type: faker.helpers.arrayElement(BOAT_TYPES),
    year: faker.date.between({
      from: new Date('1970-01-01'),
      to: new Date()
    }).getFullYear()
  };
};

/**
 * Index all existing boats in Elasticsearch
 */
export const indexExistingBoats = async () => {
  try {
    console.log('🔍 Indexing existing boats in Elasticsearch...');

    const boats = await prisma.boat.findMany();
    let indexed = 0;

    for (const boat of boats) {
      try {
        await elasticsearchService.indexBoat(boat);
        indexed++;
        if (indexed % 10 === 0) {
          console.log(`🔍 Indexed ${indexed}/${boats.length} boats...`);
        }
      } catch (error) {
        console.error(`❌ Failed to index boat ${boat.name}:`, error.message);
      }
    }

    console.log(`🎉 Successfully indexed ${indexed} existing boats in Elasticsearch!`);
    return indexed;
  } catch (error) {
    console.error('❌ Error indexing existing boats:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

/**
 * Seed boats into the database (idempotent - safe to run multiple times)
 * @param {number} count - Number of boats to create
 * @param {boolean} force - Force seeding even if data exists
 */
export const seedBoats = async (count = 50, force = false) => {
  try {
    console.log(`🚢 Starting to seed ${count} boats...`);

    const existingCount = await prisma.boat.count();
    console.log(`📊 Found ${existingCount} existing boats in database`);

    // Skip seeding if data already exists (unless forced)
    if (existingCount > 0 && !force) {
      console.log(`⏭️  Database already contains ${existingCount} boats. Skipping seeding.`);
      console.log(`🔍 Checking if boats are indexed in Elasticsearch...`);

      // Index existing boats in Elasticsearch if they're not already indexed
      try {
        const indexed = await indexExistingBoats();
        console.log(`   Use --force flag or seed:clear to reseed the database.`);
        return { created: 0, total: existingCount, indexed, skipped: true };
      } catch (error) {
        console.error('❌ Failed to index existing boats:', error.message);
        return { created: 0, total: existingCount, indexed: 0, skipped: true };
      }
    }

    const boats = [];
    for (let i = 0; i < count; i++) {
      boats.push(generateBoat());
    }

            // Create and index boats one by one to ensure proper MongoDB-Elasticsearch sync
    let created = 0;
    let indexed = 0;

    console.log('🔍 Creating boats in MongoDB and indexing in Elasticsearch...');

    for (const boatData of boats) {
      try {
        // Create boat in MongoDB
        const boat = await prisma.boat.create({
          data: boatData
        });
        created++;

        // Index boat in Elasticsearch immediately
        try {
          await elasticsearchService.indexBoat(boat);
          indexed++;
        } catch (error) {
          console.error(`❌ Failed to index boat ${boat.name}:`, error.message);
          // Continue with other boats even if indexing fails
        }

        // Progress update every 10 boats
        if (created % 10 === 0) {
          console.log(`✅ Created ${created}/${count} boats in MongoDB, indexed ${indexed} in Elasticsearch...`);
        }
      } catch (error) {
        console.error(`❌ Failed to create boat:`, error.message);
        // Continue with other boats even if one fails
      }
    }

    const totalBoats = await prisma.boat.count();
    console.log(`🎉 Successfully seeded ${created} boats! Total boats in database: ${totalBoats}`);
    console.log(`🔍 Successfully indexed ${indexed} boats in Elasticsearch!`);

    return { created, total: totalBoats, indexed, skipped: false };
  } catch (error) {
    console.error('❌ Error seeding boats:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

/**
 * Clear all boats from the database and Elasticsearch
 */
export const clearBoats = async () => {
  try {
    console.log('🗑️  Clearing all boats from database and Elasticsearch...');

    // Get all boat IDs before deleting
    const boats = await prisma.boat.findMany({ select: { id: true } });

    // Delete from MongoDB
    const result = await prisma.boat.deleteMany();
    console.log(`✅ Deleted ${result.count} boats from MongoDB`);

    // Delete from Elasticsearch
    let elasticDeleted = 0;
    for (const boat of boats) {
      try {
        await elasticsearchService.deleteBoat(boat.id);
        elasticDeleted++;
      } catch (error) {
        console.error(`❌ Failed to delete boat ${boat.id} from Elasticsearch:`, error.message);
      }
    }
    console.log(`🔍 Deleted ${elasticDeleted} boats from Elasticsearch`);

    return { mongodb: result.count, elasticsearch: elasticDeleted };
  } catch (error) {
    console.error('❌ Error clearing boats:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

/**
 * Show statistics about boats in the database
 */
export const showBoatStats = async () => {
  try {
    const totalBoats = await prisma.boat.count();

    // Group by type
    const typeStats = await prisma.boat.groupBy({
      by: ['type'],
      _count: { type: true },
      orderBy: { _count: { type: 'desc' } }
    });

    // Year range
    const boats = await prisma.boat.findMany({
      select: { year: true },
      orderBy: { year: 'asc' }
    });

    const years = boats.map(b => b.year);
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);

    console.log('\n📊 BOAT DATABASE STATISTICS');
    console.log('============================');
    console.log(`Total boats: ${totalBoats}`);
    console.log(`Year range: ${minYear} - ${maxYear}`);
    console.log('\nBoats by type:');
    typeStats.forEach(stat => {
      console.log(`  ${stat.type}: ${stat._count.type}`);
    });

    return {
      total: totalBoats,
      byType: typeStats,
      yearRange: { min: minYear, max: maxYear }
    };
  } catch (error) {
    console.error('❌ Error getting boat statistics:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};