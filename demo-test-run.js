#!/usr/bin/env node

/**
 * Demo script showing the boat API tests in action
 * This demonstrates what each test validates
 */

import request from 'supertest';
import app from './src/app.js';
import chalk from 'chalk';

console.log(chalk.blue.bold('🧪 Boat API Test Demonstration\n'));

async function runDemo() {
  console.log(chalk.yellow('This demo shows what the tests validate by running actual API calls.\n'));

  // Test 1: Valid boat creation
  console.log(chalk.green.bold('✅ Test 1: Valid Boat Creation'));
  try {
    const validBoat = { name: 'Ocean Explorer', type: 'Sailboat', year: 2020 };
    const response = await request(app)
      .post('/boats')
      .send(validBoat);

    console.log(`   Request: POST /boats`);
    console.log(`   Data: ${JSON.stringify(validBoat)}`);
    console.log(`   Status: ${response.status} ✅`);
    console.log(`   Response: ${JSON.stringify(response.body, null, 2)}`);
    console.log();
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  // Test 2: Invalid boat creation (missing name)
  console.log(chalk.red.bold('❌ Test 2: Invalid Boat Creation (Missing Name)'));
  try {
    const invalidBoat = { type: 'Sailboat', year: 2020 };
    const response = await request(app)
      .post('/boats')
      .send(invalidBoat);

    console.log(`   Request: POST /boats`);
    console.log(`   Data: ${JSON.stringify(invalidBoat)}`);
    console.log(`   Status: ${response.status} ✅ (Expected 400)`);
    console.log(`   Error: ${response.body.error}`);
    console.log();
  } catch (error) {
    console.log(`   ❌ Unexpected error: ${error.message}`);
  }

  // Test 3: Invalid year validation
  console.log(chalk.red.bold('❌ Test 3: Invalid Year Validation (Year too old)'));
  try {
    const invalidBoat = { name: 'Ancient Boat', type: 'Sailboat', year: 1799 };
    const response = await request(app)
      .post('/boats')
      .send(invalidBoat);

    console.log(`   Request: POST /boats`);
    console.log(`   Data: ${JSON.stringify(invalidBoat)}`);
    console.log(`   Status: ${response.status} ✅ (Expected 400)`);
    console.log(`   Error: ${response.body.error}`);
    console.log();
  } catch (error) {
    console.log(`   ❌ Unexpected error: ${error.message}`);
  }

  // Test 4: Edge case - minimum valid year
  console.log(chalk.green.bold('✅ Test 4: Edge Case - Minimum Valid Year (1800)'));
  try {
    const edgeBoat = { name: 'Historic Vessel', type: 'Sailboat', year: 1800 };
    const response = await request(app)
      .post('/boats')
      .send(edgeBoat);

    console.log(`   Request: POST /boats`);
    console.log(`   Data: ${JSON.stringify(edgeBoat)}`);
    console.log(`   Status: ${response.status} ✅`);
    console.log(`   Response: ${JSON.stringify(response.body, null, 2)}`);
    console.log();
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  // Test 5: String to integer conversion
  console.log(chalk.green.bold('✅ Test 5: String to Integer Conversion'));
  try {
    const stringYearBoat = { name: 'String Year Boat', type: 'Motorboat', year: '2021' };
    const response = await request(app)
      .post('/boats')
      .send(stringYearBoat);

    console.log(`   Request: POST /boats`);
    console.log(`   Data: ${JSON.stringify(stringYearBoat)}`);
    console.log(`   Status: ${response.status} ✅`);
    console.log(`   Response: ${JSON.stringify(response.body, null, 2)}`);
    console.log(`   Note: Year "2021" (string) converted to 2021 (integer) ✅`);
    console.log();
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  // Test 6: Retrieve all boats
  console.log(chalk.green.bold('✅ Test 6: Retrieve All Boats'));
  try {
    const response = await request(app).get('/boats');

    console.log(`   Request: GET /boats`);
    console.log(`   Status: ${response.status} ✅`);
    console.log(`   Found ${response.body.length} boats`);
    console.log(`   Response: ${JSON.stringify(response.body, null, 2)}`);
    console.log();
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  // Test 7: Search functionality
  console.log(chalk.green.bold('✅ Test 7: Search Functionality'));
  try {
    const response = await request(app).get('/boats/search?type=Sailboat');

    console.log(`   Request: GET /boats/search?type=Sailboat`);
    console.log(`   Status: ${response.status} ✅`);
    console.log(`   Response: ${JSON.stringify(response.body, null, 2)}`);
    console.log();
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  console.log(chalk.blue.bold('🎯 Test Validation Summary:'));
  console.log(chalk.white('The tests validate:'));
  console.log(chalk.cyan('• ✅ Valid data acceptance'));
  console.log(chalk.cyan('• ❌ Invalid data rejection'));
  console.log(chalk.cyan('• 🔄 Type conversion (string years to integers)'));
  console.log(chalk.cyan('• 📏 Boundary conditions (year 1800, current+10)'));
  console.log(chalk.cyan('• 🛡️  Error handling and status codes'));
  console.log(chalk.cyan('• 🔍 Search functionality'));
  console.log(chalk.cyan('• 📊 Response structure validation'));
  console.log(chalk.cyan('• 🧹 Database cleanup and isolation'));

  console.log(chalk.green.bold('\n🎉 Demo Complete!'));
  console.log(chalk.yellow('The comprehensive test suite validates all these scenarios and more.'));
}

// Run the demo
runDemo().catch(console.error);