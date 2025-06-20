# Boat API Testing Suite

This directory contains comprehensive tests for the boat creation and management endpoints in the sailing location application.

## Overview

The test suite covers all CRUD operations for boats:
- **POST /boats** - Creating new boats
- **GET /boats** - Retrieving all boats
- **PUT /boats/:id** - Updating existing boats
- **DELETE /boats/:id** - Deleting boats
- **GET /boats/search** - Searching boats with filters

## Prerequisites

Before running tests, ensure you have:

1. **Dependencies installed**:
   ```bash
   npm install
   ```

2. **Database running**: Make sure MongoDB is running and accessible
3. **Environment variables**: Ensure `DATABASE_URL` is properly configured
4. **Elasticsearch** (optional): For search functionality tests

## How to Run Tests

### Option 1: Run All Tests
```bash
npm run test
```

### Option 2: Run Boat Tests Only
```bash
npm run test:boats
```

### Option 3: Run Tests in Watch Mode
```bash
npm run test:watch
```

### Option 4: Run Individual Test Files
For the comprehensive Jest-based tests:
```bash
node tests/boats.test.js
```

For the simplified custom framework tests:
```bash
node tests/boats-simple.test.js
```

## Test Structure

### Test Files

1. **`boats.test.js`** - Comprehensive Jest-based test suite with detailed edge cases
2. **`boats-simple.test.js`** - Simplified test suite using custom framework
3. **`test-framework.js`** - Custom lightweight testing framework
4. **`run-tests.js`** - Test runner for executing multiple test suites

## Test Cases Explained

### 1. POST /boats - Boat Creation Tests

#### ✅ **Positive Test Cases**
- **Valid boat creation**: Tests creation with all required fields (name, type, year)
- **Edge case years**: Tests minimum valid year (1800) and maximum valid year (current + 10)
- **String year conversion**: Tests that year provided as string "2020" is converted to integer
- **Multiple boat creation**: Ensures multiple boats can be created with unique IDs

#### ❌ **Negative Test Cases**
- **Missing name**: Validates rejection when name field is missing
- **Empty name**: Validates rejection when name is empty string
- **Whitespace-only name**: Validates rejection when name contains only spaces
- **Missing type**: Validates rejection when type field is missing
- **Empty type**: Validates rejection when type is empty string
- **Missing year**: Validates rejection when year field is missing
- **Invalid year - too old**: Tests rejection of years before 1800
- **Invalid year - too new**: Tests rejection of years more than 10 years in future
- **Invalid year - string**: Tests rejection of non-numeric year values
- **Invalid year - float**: Tests rejection of decimal year values
- **Invalid JSON**: Tests handling of malformed request payloads

### 2. GET /boats - Retrieval Tests

#### Test Cases
- **Empty database**: Verifies empty array returned when no boats exist
- **Multiple boats**: Verifies all boats are returned with correct structure
- **Response structure**: Validates that each boat has required fields (id, name, type, year)

### 3. PUT /boats/:id - Update Tests

#### ✅ **Positive Test Cases**
- **Partial updates**: Tests updating individual fields (name, type, or year)
- **Multiple field updates**: Tests updating multiple fields simultaneously
- **Data persistence**: Verifies unchanged fields remain intact

#### ❌ **Negative Test Cases**
- **Non-existent boat**: Tests 404 response for invalid boat IDs
- **Invalid update data**: Tests validation on update fields
- **Invalid year updates**: Tests year validation during updates

### 4. DELETE /boats/:id - Deletion Tests

#### Test Cases
- **Successful deletion**: Verifies boat deletion and 204 status code
- **Deletion verification**: Confirms boat is removed from database
- **Non-existent boat**: Tests 404 response for invalid boat IDs

### 5. GET /boats/search - Search Tests

#### Test Cases
- **Basic search**: Tests search functionality without parameters
- **Type filtering**: Tests filtering boats by type
- **Year filtering**: Tests filtering boats by specific year
- **Year range filtering**: Tests filtering boats by year range (yearMin, yearMax)
- **Query string search**: Tests text-based search functionality
- **Response format**: Validates search results are returned as arrays

## Test Data Management

### Database Cleanup
- **beforeAll**: Cleans database before test suite starts
- **beforeEach**: Cleans database before each individual test
- **afterAll**: Cleans database and disconnects after all tests complete

### Test Data
```javascript
const validBoat = {
  name: 'Ocean Explorer',
  type: 'Sailboat',
  year: 2020
};
```

## Validation Rules Tested

### Name Validation
- ✅ Must be present
- ✅ Must be non-empty string
- ✅ Must not be only whitespace
- ✅ Can contain any valid string characters

### Type Validation
- ✅ Must be present
- ✅ Must be non-empty string
- ✅ Can be any string value (Sailboat, Motorboat, etc.)

### Year Validation
- ✅ Must be present
- ✅ Must be integer or convertible to integer
- ✅ Must be >= 1800
- ✅ Must be <= (current year + 10)
- ❌ Cannot be float/decimal
- ❌ Cannot be non-numeric string

## Error Handling Tests

### HTTP Status Codes Tested
- **200**: Successful GET, PUT operations
- **201**: Successful POST (creation)
- **204**: Successful DELETE
- **400**: Bad request (validation errors)
- **404**: Resource not found
- **500**: Server errors (tested implicitly through error conditions)

### Error Messages Tested
- `"Name is required and must be a non-empty string"`
- `"Type is required and must be a non-empty string"`
- `"Year is required and must be a valid year"`
- `"Year must be a valid year"` (for updates)
- `"Bateau non trouvé"` (French: "Boat not found")

## Integration with External Services

### Elasticsearch Integration
- Tests handle Elasticsearch indexing gracefully
- Search tests accommodate both successful indexing and failure scenarios
- Tests include delays for Elasticsearch indexing when needed

### Database Integration
- Tests work with real MongoDB database via Prisma
- Proper transaction handling and cleanup
- Connection management and disconnection

## Best Practices Demonstrated

1. **Test Isolation**: Each test is independent and doesn't rely on others
2. **Data Cleanup**: Database is cleaned between tests to prevent interference
3. **Edge Case Testing**: Boundary conditions are thoroughly tested
4. **Error Scenario Coverage**: Both happy path and error conditions are tested
5. **Realistic Test Data**: Tests use realistic boat names, types, and years
6. **Async/Await**: Proper handling of asynchronous operations
7. **Resource Cleanup**: Database connections and resources are properly closed

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Ensure MongoDB is running
   - Check DATABASE_URL environment variable
   - Verify network connectivity

2. **Test Timeouts**
   - Tests have 30-second timeout by default
   - Elasticsearch indexing delays may cause timeouts
   - Check database performance

3. **Elasticsearch Errors**
   - Search tests are designed to be resilient to Elasticsearch failures
   - Elasticsearch service is optional for basic CRUD tests

### Running Tests in Different Environments

**Development Environment**:
```bash
NODE_ENV=development npm run test
```

**Test Environment**:
```bash
NODE_ENV=test npm run test
```

**Production Testing** (not recommended):
```bash
NODE_ENV=production npm run test
```

## Coverage Summary

The test suite provides comprehensive coverage of:
- ✅ All boat CRUD endpoints
- ✅ Input validation and sanitization
- ✅ Error handling and status codes
- ✅ Database operations and cleanup
- ✅ Search functionality
- ✅ Edge cases and boundary conditions
- ✅ Async operation handling
- ✅ Integration with external services