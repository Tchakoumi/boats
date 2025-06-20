import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function testElasticsearch() {
  console.log('🧪 Testing Elasticsearch integration...\n');

  try {
    // 1. Test API health
    console.log('1. Testing API health...');
    const healthResponse = await fetch(`${BASE_URL}/`);
    const healthData = await healthResponse.json();
    console.log('✅ API Health:', healthData.message);
    console.log('📊 Elasticsearch Status:', healthData.elasticsearch?.status);
    console.log();

    // 2. Test Elasticsearch health directly
    console.log('2. Testing Elasticsearch health...');
    const esHealthResponse = await fetch(`${BASE_URL}/elasticsearch/health`);
    const esHealthData = await esHealthResponse.json();
    console.log('✅ Elasticsearch Health:', esHealthData);
    console.log();

    // 3. Create sample boats
    console.log('3. Creating sample boats...');
    const sampleBoats = [
      { name: 'Sailfish Deluxe', type: 'Sailing', year: 2020 },
      { name: 'Ocean Explorer', type: 'Motor', year: 2021 },
      { name: 'Wind Rider', type: 'Sailing', year: 2019 },
      { name: 'Sea Master Pro', type: 'Fishing', year: 2022 },
      { name: 'Sunset Cruiser', type: 'Motor', year: 2018 }
    ];

    const createdBoats = [];
    for (const boat of sampleBoats) {
      const response = await fetch(`${BASE_URL}/boats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(boat)
      });
      const createdBoat = await response.json();
      createdBoats.push(createdBoat);
      console.log(`✅ Created: ${boat.name}`);
    }
    console.log();

    // Wait a bit for indexing
    console.log('⏳ Waiting for Elasticsearch indexing...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log();

    // 4. Test search functionality
    console.log('4. Testing search functionality...');

    // Search by text
    console.log('📍 Searching for "sail"...');
    let searchResponse = await fetch(`${BASE_URL}/boats/search?q=sail`);
    let searchData = await searchResponse.json();
    console.log(`Found ${searchData.total} boats:`, searchData.boats.map(b => b.name));
    console.log();

    // Search by type
    console.log('📍 Searching for Motor boats...');
    searchResponse = await fetch(`${BASE_URL}/boats/search?type=Motor`);
    searchData = await searchResponse.json();
    console.log(`Found ${searchData.total} Motor boats:`, searchData.boats.map(b => b.name));
    console.log();

    // Search by year range
    console.log('📍 Searching for boats from 2020-2022...');
    searchResponse = await fetch(`${BASE_URL}/boats/search?yearMin=2020&yearMax=2022`);
    searchData = await searchResponse.json();
    console.log(`Found ${searchData.total} boats (2020-2022):`, searchData.boats.map(b => `${b.name} (${b.year})`));
    console.log();

    // Search with multiple filters
    console.log('📍 Searching for Sailing boats with "wind" in name...');
    searchResponse = await fetch(`${BASE_URL}/boats/search?q=wind&type=Sailing`);
    searchData = await searchResponse.json();
    console.log(`Found ${searchData.total} boats:`, searchData.boats.map(b => b.name));
    console.log();

    // 5. Test update functionality
    console.log('5. Testing update with Elasticsearch sync...');
    const boatToUpdate = createdBoats[0];
    const updateResponse = await fetch(`${BASE_URL}/boats/${boatToUpdate.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Updated Sailfish Deluxe', year: 2023 })
    });
    const updatedBoat = await updateResponse.json();
    console.log('✅ Updated boat:', updatedBoat.name, 'Year:', updatedBoat.year);
    console.log();

    // 6. Get all boats to verify
    console.log('6. Getting all boats...');
    const allBoatsResponse = await fetch(`${BASE_URL}/boats`);
    const allBoats = await allBoatsResponse.json();
    console.log(`📋 Total boats in database: ${allBoats.length}`);
    allBoats.forEach(boat => console.log(`  - ${boat.name} (${boat.type}, ${boat.year})`));

    console.log('\n🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testElasticsearch();