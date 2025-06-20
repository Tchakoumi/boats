// Jest setup file for boat API tests

// Set test timeout
jest.setTimeout(30000);

// Global test configuration
global.console = {
  ...console,
  // Suppress console logs during tests (uncomment if needed)
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Cleanup function for after each test
afterEach(async () => {
  // Add any global cleanup here if needed
});

// Global teardown
afterAll(async () => {
  // Force exit after tests complete
  setTimeout(() => {
    process.exit(0);
  }, 1000);
});