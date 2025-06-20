// Simple test framework for boat API tests
class TestFramework {
  constructor() {
    this.suites = [];
    this.currentSuite = null;
    this.stats = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0
    };
  }

  describe(name, fn) {
    const suite = {
      name,
      tests: [],
      beforeEach: null,
      afterEach: null,
      beforeAll: null,
      afterAll: null
    };

    this.suites.push(suite);
    const previousSuite = this.currentSuite;
    this.currentSuite = suite;

    try {
      fn();
    } finally {
      this.currentSuite = previousSuite;
    }
  }

  it(name, fn) {
    if (!this.currentSuite) {
      throw new Error('Tests must be inside a describe block');
    }

    this.currentSuite.tests.push({
      name,
      fn,
      skip: false
    });
  }

  beforeEach(fn) {
    if (!this.currentSuite) {
      throw new Error('beforeEach must be inside a describe block');
    }
    this.currentSuite.beforeEach = fn;
  }

  afterEach(fn) {
    if (!this.currentSuite) {
      throw new Error('afterEach must be inside a describe block');
    }
    this.currentSuite.afterEach = fn;
  }

  beforeAll(fn) {
    if (!this.currentSuite) {
      throw new Error('beforeAll must be inside a describe block');
    }
    this.currentSuite.beforeAll = fn;
  }

  afterAll(fn) {
    if (!this.currentSuite) {
      throw new Error('afterAll must be inside a describe block');
    }
    this.currentSuite.afterAll = fn;
  }

  async run() {
    console.log('🏃 Running tests...\n');

    for (const suite of this.suites) {
      console.log(`📦 ${suite.name}`);

      // Run beforeAll hook
      if (suite.beforeAll) {
        try {
          await suite.beforeAll();
        } catch (error) {
          console.log(`❌ beforeAll failed: ${error.message}`);
          continue;
        }
      }

      // Run tests
      for (const test of suite.tests) {
        if (test.skip) {
          console.log(`⏭️  ${test.name} (skipped)`);
          this.stats.skipped++;
          continue;
        }

        this.stats.total++;

        try {
          // Run beforeEach hook
          if (suite.beforeEach) {
            await suite.beforeEach();
          }

          // Run test
          await test.fn();

          // Run afterEach hook
          if (suite.afterEach) {
            await suite.afterEach();
          }

          console.log(`✅ ${test.name}`);
          this.stats.passed++;

        } catch (error) {
          console.log(`❌ ${test.name}`);
          console.log(`   Error: ${error.message}`);
          if (error.stack) {
            console.log(`   Stack: ${error.stack.split('\n')[1]?.trim()}`);
          }
          this.stats.failed++;
        }
      }

      // Run afterAll hook
      if (suite.afterAll) {
        try {
          await suite.afterAll();
        } catch (error) {
          console.log(`⚠️  afterAll failed: ${error.message}`);
        }
      }

      console.log('');
    }

    // Print summary
    console.log('📊 Test Results:');
    console.log(`   Total: ${this.stats.total}`);
    console.log(`   Passed: ${this.stats.passed}`);
    console.log(`   Failed: ${this.stats.failed}`);
    console.log(`   Skipped: ${this.stats.skipped}`);

    if (this.stats.failed > 0) {
      console.log('\n❌ Some tests failed!');
      process.exit(1);
    } else {
      console.log('\n🎉 All tests passed!');
      process.exit(0);
    }
  }
}

// Simple assertion library
class Expect {
  constructor(actual) {
    this.actual = actual;
  }

  toBe(expected) {
    if (this.actual !== expected) {
      throw new Error(`Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(this.actual)}`);
    }
  }

  toEqual(expected) {
    if (JSON.stringify(this.actual) !== JSON.stringify(expected)) {
      throw new Error(`Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(this.actual)}`);
    }
  }

  toHaveProperty(property) {
    if (!(property in this.actual)) {
      throw new Error(`Expected object to have property "${property}"`);
    }
  }

  toHaveLength(length) {
    if (!this.actual || this.actual.length !== length) {
      throw new Error(`Expected length ${length}, but got ${this.actual?.length}`);
    }
  }

  not = {
    toBe: (expected) => {
      if (this.actual === expected) {
        throw new Error(`Expected not to be ${JSON.stringify(expected)}`);
      }
    }
  };
}

// Global functions
const framework = new TestFramework();

global.describe = framework.describe.bind(framework);
global.it = framework.it.bind(framework);
global.beforeEach = framework.beforeEach.bind(framework);
global.afterEach = framework.afterEach.bind(framework);
global.beforeAll = framework.beforeAll.bind(framework);
global.afterAll = framework.afterAll.bind(framework);
global.expect = (actual) => new Expect(actual);

// Run tests when this module is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  framework.run();
}

export default framework;