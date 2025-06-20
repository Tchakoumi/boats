import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';

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
      console.log(`   Use --force flag or seed:clear to reseed the database.`);
      return { created: 0, total: existingCount, skipped: true };
    }

    const boats = [];
    for (let i = 0; i < count; i++) {
      boats.push(generateBoat());
    }

    // Insert boats in batches for better performance
    const batchSize = 10;
    let created = 0;

    for (let i = 0; i < boats.length; i += batchSize) {
      const batch = boats.slice(i, i + batchSize);
      await prisma.boat.createMany({
        data: batch
      });
      created += batch.length;
      console.log(`✅ Created ${created}/${count} boats...`);
    }

    const totalBoats = await prisma.boat.count();
    console.log(`🎉 Successfully seeded ${created} boats! Total boats in database: ${totalBoats}`);

    return { created, total: totalBoats, skipped: false };
  } catch (error) {
    console.error('❌ Error seeding boats:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

/**
 * Clear all boats from the database
 */
export const clearBoats = async () => {
  try {
    console.log('🗑️  Clearing all boats from database...');
    const result = await prisma.boat.deleteMany();
    console.log(`✅ Deleted ${result.count} boats`);
    return result.count;
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