/**
 * Artillery processor for SailingLoc boat load testing
 * Provides helper functions and custom logic for realistic test scenarios
 */

const boatTypes = [
  'Sailboat', 'Motorboat', 'Yacht', 'FishingBoat', 'Houseboat',
  'Canoe', 'Kayak', 'Ferry', 'Speedboat', 'Tugboat'
];

const boatNamePrefixes = [
  'Ocean', 'Sea', 'Wave', 'Wind', 'Storm', 'Calm', 'Swift', 'Royal',
  'Adventure', 'Explorer', 'Dream', 'Spirit', 'Liberty', 'Freedom',
  'Mystic', 'Golden', 'Silver', 'Blue', 'White', 'Crystal'
];

const boatNameSuffixes = [
  'Breeze', 'Runner', 'Dancer', 'Hunter', 'Cruiser', 'Explorer',
  'Wanderer', 'Navigator', 'Captain', 'Admiral', 'Voyager', 'Pioneer',
  'Champion', 'Master', 'Legend', 'Star', 'Crown', 'Diamond'
];

/**
 * Generate a random boat name
 */
function generateBoatName() {
  const prefix = boatNamePrefixes[Math.floor(Math.random() * boatNamePrefixes.length)];
  const suffix = boatNameSuffixes[Math.floor(Math.random() * boatNameSuffixes.length)];
  return `${prefix} ${suffix}`;
}

/**
 * Generate a realistic year based on boat type
 */
function generateRealisticYear(type) {
  const currentYear = new Date().getFullYear();
  
  switch (type) {
    case 'Yacht':
      // Yachts tend to be newer
      return Math.floor(Math.random() * 15) + (currentYear - 10);
    case 'Ferry':
    case 'Tugboat':
      // Commercial vessels have longer lifespans
      return Math.floor(Math.random() * 30) + (currentYear - 25);
    case 'Canoe':
    case 'Kayak':
      // Small watercraft are usually newer
      return Math.floor(Math.random() * 10) + (currentYear - 5);
    default:
      // General boats
      return Math.floor(Math.random() * 25) + (currentYear - 20);
  }
}

/**
 * Setup function called before the test starts
 */
function setupTest(context, events, done) {
  console.log('🚢 Starting SailingLoc load test...');
  console.log(`📊 Target: ${context.target}`);
  
  // Add custom functions to context
  context.vars.generateBoatName = generateBoatName;
  context.vars.generateRealisticYear = generateRealisticYear;
  context.vars.boatTypes = boatTypes;
  
  // Performance tracking
  context.vars.startTime = Date.now();
  context.vars.requestCount = 0;
  context.vars.errorCount = 0;
  
  done();
}

/**
 * Before each request
 */
function beforeRequest(requestParams, context, events, done) {
  context.vars.requestCount++;
  
  // Add random delay for more realistic behavior
  const delay = Math.random() * 500; // 0-500ms random delay
  setTimeout(() => {
    done();
  }, delay);
}

/**
 * After each response
 */
function afterResponse(requestParams, response, context, events, done) {
  // Track errors
  if (response.statusCode >= 400) {
    context.vars.errorCount++;
    console.log(`❌ Error ${response.statusCode}: ${requestParams.url}`);
  }
  
  // Log slow requests
  if (response.timings && response.timings.response > 1000) {
    console.log(`⚠️  Slow request: ${requestParams.url} took ${response.timings.response}ms`);
  }
  
  done();
}

/**
 * Custom function to generate search queries
 */
function generateSearchQuery(context, events, done) {
  const queries = [
    'luxury', 'sport', 'classic', 'new', 'vintage', 'modern',
    'ocean', 'sea', 'fast', 'comfortable', 'family', 'racing'
  ];
  
  context.vars.searchQuery = queries[Math.floor(Math.random() * queries.length)];
  done();
}

/**
 * Custom function to simulate user behavior patterns
 */
function simulateUserBehavior(context, events, done) {
  const userTypes = ['owner', 'broker', 'marina'];
  const userType = userTypes[Math.floor(Math.random() * userTypes.length)];
  
  context.vars.userType = userType;
  
  // Set behavior patterns based on user type
  switch (userType) {
    case 'owner':
      context.vars.searchProbability = 0.1;
      context.vars.createProbability = 0.05;
      context.vars.updateProbability = 0.3;
      break;
    case 'broker':
      context.vars.searchProbability = 0.6;
      context.vars.createProbability = 0.15;
      context.vars.updateProbability = 0.1;
      break;
    case 'marina':
      context.vars.searchProbability = 0.35;
      context.vars.createProbability = 0.4;
      context.vars.updateProbability = 0.25;
      break;
  }
  
  done();
}

/**
 * Test completion summary
 */
function testComplete(context, events, done) {
  const duration = (Date.now() - context.vars.startTime) / 1000;
  const errorRate = (context.vars.errorCount / context.vars.requestCount) * 100;
  
  console.log('\n🏁 Load test completed!');
  console.log(`📈 Total requests: ${context.vars.requestCount}`);
  console.log(`❌ Total errors: ${context.vars.errorCount}`);
  console.log(`📊 Error rate: ${errorRate.toFixed(2)}%`);
  console.log(`⏱️  Duration: ${duration.toFixed(2)}s`);
  console.log(`🚀 RPS: ${(context.vars.requestCount / duration).toFixed(2)}`);
  
  done();
}

module.exports = {
  setupTest,
  beforeRequest,
  afterResponse,
  generateSearchQuery,
  simulateUserBehavior,
  testComplete,
  generateBoatName,
  generateRealisticYear
};