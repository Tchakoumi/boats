import { spawn } from 'child_process';
import { readdir } from 'fs/promises';
import { join } from 'path';

const TEST_DIR = './tests';
const TEST_TIMEOUT = 30000; // 30 seconds per test suite

async function runTests() {
  console.log('🚀 Starting test runner...\n');

  try {
    // Get all test files
    const files = await readdir(TEST_DIR);
    const testFiles = files.filter(file =>
      file.endsWith('.test.js') &&
      file !== 'run-tests.js' &&
      file !== 'boats.test.js' // Exclude Jest-based test for now
    );

    if (testFiles.length === 0) {
      console.log('❌ No test files found!');
      return;
    }

    console.log(`📁 Found ${testFiles.length} test file(s):`);
    testFiles.forEach(file => console.log(`   - ${file}`));
    console.log('');

    let totalPassed = 0;
    let totalFailed = 0;
    let totalSuites = 0;

    // Run each test file
    for (const testFile of testFiles) {
      const testPath = join(TEST_DIR, testFile);
      console.log(`🧪 Running tests in ${testFile}...`);

      try {
        const result = await runTestFile(testPath);
        totalSuites++;

        if (result.success) {
          console.log(`✅ ${testFile} - All tests passed`);
          totalPassed++;
        } else {
          console.log(`❌ ${testFile} - Some tests failed`);
          totalFailed++;
        }
      } catch (error) {
        console.log(`💥 ${testFile} - Test suite crashed: ${error.message}`);
        totalFailed++;
        totalSuites++;
      }

      console.log('');
    }

    // Summary
    console.log('📊 Test Summary:');
    console.log(`   Total test suites: ${totalSuites}`);
    console.log(`   Passed: ${totalPassed}`);
    console.log(`   Failed: ${totalFailed}`);

    if (totalFailed > 0) {
      console.log('\n❌ Some tests failed!');
      process.exit(1);
    } else {
      console.log('\n🎉 All tests passed!');
      process.exit(0);
    }

  } catch (error) {
    console.error('💥 Test runner failed:', error);
    process.exit(1);
  }
}

function runTestFile(testPath) {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [testPath], {
      stdio: 'pipe',
      env: { ...process.env, NODE_ENV: 'test' }
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
      process.stdout.write(data);
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
      process.stderr.write(data);
    });

    const timeout = setTimeout(() => {
      child.kill();
      reject(new Error(`Test timeout after ${TEST_TIMEOUT}ms`));
    }, TEST_TIMEOUT);

    child.on('close', (code) => {
      clearTimeout(timeout);
      resolve({
        success: code === 0,
        code,
        stdout,
        stderr
      });
    });

    child.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
}

// Run tests
runTests();