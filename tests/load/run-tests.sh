#!/bin/bash

# SailingLoc Load Testing Script
# Run this script to execute all load testing scenarios
# Make sure your application is running on localhost:3000

set -e

echo "🚢 SailingLoc Load Testing Suite"
echo "================================="

# Load environment variables from .env file
if [ -f "../../.env" ]; then
    echo "📋 Loading environment variables from .env..."
    export $(grep -v '^#' ../../.env | xargs)
fi

# Check for Artillery Cloud integration
CLOUD_ENABLED=false
if [ ! -z "$ARTILLERY_KEY" ]; then
    CLOUD_ENABLED=true
    echo "☁️  Artillery Cloud integration enabled"
    echo "📊 Test results will be uploaded to Artillery Cloud dashboard"
    echo "🔗 Dashboard: https://app.artillery.io/"
else
    echo "💻 Running in local mode (no ARTILLERY_KEY found)"
    echo "💡 Tip: Set ARTILLERY_KEY in .env for cloud dashboard integration"
fi

echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Artillery is installed
if ! command -v artillery &> /dev/null; then
    echo -e "${RED}❌ Artillery is not installed. Please install it first:${NC}"
    echo "npm install -g artillery"
    exit 1
fi

# Check if the application is running
echo "🔍 Checking if SailingLoc API is running..."
if ! curl -s http://localhost:3000/ > /dev/null; then
    echo -e "${RED}❌ SailingLoc API is not running on localhost:3000${NC}"
    echo "Please start the application first:"
    echo "  npm run dev"
    echo "  or"
    echo "  docker-compose up"
    exit 1
fi

echo -e "${GREEN}✅ SailingLoc API is running${NC}"

# Create reports directory
mkdir -p ./reports

# Function to run a test with proper error handling
run_test() {
    local test_name=$1
    local test_file=$2
    local description=$3
    
    echo ""
    echo -e "${YELLOW}🧪 Running $test_name${NC}"
    echo "📝 $description"
    echo "⏰ Started at: $(date)"
    
    # Prepare Artillery command based on cloud availability
    local artillery_cmd="artillery run"
    local output_file="./reports/${test_name}-$(date +%Y%m%d-%H%M%S).json"
    
    if [ "$CLOUD_ENABLED" = true ]; then
        echo "☁️  Uploading results to Artillery Cloud..."
        artillery_cmd="artillery run --record --key $ARTILLERY_KEY"
        
        # Add tags for better organization in cloud dashboard
        local tags="--tags environment:load-test,service:sailingloc,scenario:${test_name},timestamp:$(date +%Y%m%d-%H%M%S)"
        artillery_cmd="$artillery_cmd $tags"
    fi
    
    # Execute the test
    if $artillery_cmd "$test_file" --output "$output_file"; then
        echo -e "${GREEN}✅ $test_name completed successfully${NC}"
        
        if [ "$CLOUD_ENABLED" = true ]; then
            echo "🔗 View results at: https://app.artillery.io/"
        else
            echo "📊 Generate HTML report: artillery report $output_file"
        fi
    else
        echo -e "${RED}❌ $test_name failed${NC}"
        return 1
    fi
}

# Menu for test selection
echo ""
echo "Select which tests to run:"
echo "1) Normal Hours Load Test (60 seconds, 30 RPS)"
echo "2) Peak Hours Load Test (3 hours, up to 70 RPS)"
echo "3) Stress Test (30 minutes, up to 180 RPS)"
echo "4) All Tests (Sequential execution)"
echo "5) Quick Test (10 VUs, 10 requests each - fast validation)"

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        run_test "normal-hours" "./normal-hours.yml" "Simulates normal business hours with 200 concurrent users"
        ;;
    2)
        run_test "peak-hours" "./peak-hours.yml" "Simulates peak hours with 400 concurrent users"
        ;;
    3)
        echo -e "${YELLOW}⚠️  WARNING: This is a stress test that may impact system performance${NC}"
        read -p "Are you sure you want to continue? (y/N): " confirm
        if [[ $confirm =~ ^[Yy]$ ]]; then
            run_test "stress-test" "./stress-test.yml" "High-intensity stress test with 1000+ concurrent users"
        else
            echo "Stress test cancelled"
        fi
        ;;
    4)
        echo -e "${YELLOW}🔄 Running all tests sequentially...${NC}"
        run_test "normal-hours" "./normal-hours.yml" "Normal business hours test"
        sleep 30  # Cool down period
        run_test "peak-hours" "./peak-hours.yml" "Peak hours test"
        sleep 60  # Cool down period
        echo -e "${YELLOW}⚠️  Starting stress test in 10 seconds... Press Ctrl+C to cancel${NC}"
        sleep 10
        run_test "stress-test" "./stress-test.yml" "Stress test"
        ;;
    5)
        # Quick test version
        echo -e "${YELLOW}🏃‍♂️ Running quick test (10 VUs, 10 requests each)${NC}"
        if [ "$CLOUD_ENABLED" = true ]; then
            artillery quick http://localhost:3000/boats --count 10 --num 10 --record --key $ARTILLERY_KEY --tags environment:quick-test,service:sailingloc
            echo "🔗 View results at: https://app.artillery.io/"
        else
            artillery quick http://localhost:3000/boats --count 10 --num 10
        fi
        ;;
    *)
        echo -e "${RED}Invalid choice. Exiting.${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}🎉 Load testing completed!${NC}"

if [ "$CLOUD_ENABLED" = true ]; then
    echo "☁️  Results uploaded to Artillery Cloud dashboard"
    echo "🔗 View detailed analytics at: https://app.artillery.io/"
    echo "📊 Features available:"
    echo "   - Real-time performance graphs"
    echo "   - Historical trend analysis"
    echo "   - Automated SLA monitoring"
    echo "   - Team collaboration dashboards"
else
    echo "💻 Local reports available in: ./reports/"
    echo "📈 To generate HTML reports:"
    echo "   artillery report ./reports/[report-file].json"
    echo ""
    echo "💡 For enhanced analytics, add ARTILLERY_KEY to your .env file"
fi

echo ""
echo "🔍 Monitor your application logs for any errors or performance issues."