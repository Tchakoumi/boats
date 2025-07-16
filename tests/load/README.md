# SailingLoc Load Testing Suite

Professional Artillery-based load testing for the SailingLoc boat management API.

## 📁 Structure

```
tests/load/
├── normal-hours.yml      # Normal business hours test (30 RPS, 60 min)
├── peak-hours.yml        # Peak hours test (70 RPS, 3 hours)
├── stress-test.yml       # Stress test (180 RPS, 30 min)
├── run-tests.sh          # Test execution script
├── data/
│   └── boats.csv         # Test data for boat creation
├── processors/
│   └── boat-processor.cjs # Custom Artillery processor
└── reports/              # Generated test reports (auto-created)
```

## 🚀 Quick Start

### Prerequisites

1. **Install Artillery globally:**
   ```bash
   npm install -g artillery
   ```

2. **Configure Artillery Cloud (Recommended):**
   ```bash
   # Add your Artillery Cloud key to .env file
   echo "ARTILLERY_KEY=your_artillery_cloud_key_here" >> ../../.env
   ```

3. **Start SailingLoc API:**
   ```bash
   # Option 1: Development mode
   npm run dev
   
   # Option 2: Docker
   docker-compose up
   ```

4. **Verify API is running:**
   ```bash
   curl http://localhost:3000/
   ```

### 🌟 Artillery Cloud Benefits

With `ARTILLERY_KEY` configured, you get:

- **📊 Real-time dashboards** with live performance graphs
- **📈 Historical trends** and performance comparison
- **🚨 Automated alerting** when SLA thresholds are breached  
- **👥 Team collaboration** with shared reports and insights
- **🎯 Advanced analytics** including P95/P99 latency heatmaps
- **🔍 Detailed endpoint analysis** with response time breakdowns

### Running Tests

#### Interactive Menu (Recommended)
```bash
cd tests/load
./run-tests.sh
```

**The script automatically detects your setup:**
- 🌩️ **With ARTILLERY_KEY**: Uploads results to Artillery Cloud with real-time dashboards
- 💻 **Without ARTILLERY_KEY**: Generates local JSON/HTML reports

#### Manual Execution

**With Artillery Cloud:**
```bash
# Load environment variables
export ARTILLERY_KEY=$(grep ARTILLERY_KEY ../../.env | cut -d'=' -f2)

# Normal hours test with cloud upload
artillery run normal-hours.yml --record --key $ARTILLERY_KEY \
  --tags environment:load-test,service:sailingloc,scenario:normal-hours

# Peak hours test with real-time monitoring  
artillery run peak-hours.yml --record --key $ARTILLERY_KEY \
  --tags environment:load-test,service:sailingloc,scenario:peak-hours

# Stress test with automated alerting
artillery run stress-test.yml --record --key $ARTILLERY_KEY \
  --tags environment:load-test,service:sailingloc,scenario:stress-test
```

**Local mode (without cloud):**
```bash
# Normal hours test
artillery run normal-hours.yml --output reports/normal-$(date +%Y%m%d).json

# Peak hours test  
artillery run peak-hours.yml --output reports/peak-$(date +%Y%m%d).json

# Stress test (use with caution)
artillery run stress-test.yml --output reports/stress-$(date +%Y%m%d).json
```

#### Quick Performance Check
```bash
# With Artillery Cloud (recommended)
artillery quick http://localhost:3000/boats --count 10 --num 10 \
  --record --key $ARTILLERY_KEY --tags environment:quick-test,service:sailingloc

# Local mode  
artillery quick http://localhost:3000/boats --count 10 --num 10

# Parameters explanation:
# --count 10: Creates 10 virtual users simultaneously
# --num 10:   Each user makes 10 requests
# Total:      100 requests for quick validation
```

## 🔧 Artillery Command Reference

### Quick Commands
```bash
# Basic quick test
artillery quick http://localhost:3000/boats

# Custom quick test (recommended)
artillery quick http://localhost:3000/boats --count 20 --num 5

# Quick test with output report
artillery quick http://localhost:3000/boats --count 10 --num 10 --output quick-test.json

# Quick test flags:
# -c, --count: Number of virtual users (default: 10)
# -n, --num:   Number of requests per user (default: 10)  
# -o, --output: Save JSON report
# -q, --quiet: Quiet mode
# -k, --insecure: Allow insecure TLS
```

## 📊 Test Scenarios

### 1. Normal Hours (`normal-hours.yml`)
- **Duration:** 60 minutes
- **Load:** 30 RPS sustained
- **Users:** ~200 concurrent
- **Purpose:** Baseline performance validation

**Endpoints tested:**
- `GET /` (5% - health checks)
- `GET /boats` (35% - list all boats)
- `GET /boats/search` (25% - search functionality)
- `POST /boats` (15% - create boats)
- `PUT /boats/:id` (15% - update boats)
- `DELETE /boats/:id` (5% - delete boats)

### 2. Peak Hours (`peak-hours.yml`)
- **Duration:** 3 hours (5min ramp + 170min peak + 5min ramp down)
- **Load:** Up to 70 RPS
- **Users:** ~400 concurrent
- **Purpose:** Production peak load simulation

**User behavior patterns:**
- **Marina professionals** (40%): Bulk operations, frequent creates/updates
- **Brokers** (35%): Intensive search queries, complex filters
- **Boat owners** (25%): Occasional updates, simple searches

### 3. Stress Test (`stress-test.yml`)
- **Duration:** 30 minutes (10min ramp + 15min stress + 5min ramp down)
- **Load:** Up to 180 RPS
- **Users:** 800-1,200 concurrent
- **Purpose:** Breaking point identification

**Features:**
- Parallel request execution
- Aggressive load patterns
- Error tolerance (accepts 5xx responses)
- Minimal think time between requests

## 📈 Monitoring & Metrics

### Key Metrics Tracked
- **Response time** (p50, p95, p99)
- **Request rate** (RPS)
- **Error rate** (% failed requests)
- **Throughput** (requests/second)
- **Latency distribution**

### Expected Performance Targets
- **GET requests:** < 200ms (p95)
- **POST/PUT requests:** < 500ms (p95)
- **Error rate:** < 1%
- **Availability:** > 99.5%

### Report Generation

**With Artillery Cloud:**
- 🔗 **Live dashboards**: https://app.artillery.io/
- 📊 **Real-time graphs** during test execution
- 📈 **Historical comparisons** across test runs
- 🚨 **Automated alerts** when thresholds are exceeded
- 📱 **Mobile-friendly** dashboards for monitoring on-the-go

**Local mode:**
```bash
# Generate HTML report from JSON output
artillery report reports/normal-20241216.json

# Real-time monitoring (separate terminal)
artillery run peak-hours.yml --quiet | grep -E "(RPS|p95|errors)"
```

## 🔧 Configuration

### Environment Variables
```bash
# Artillery Cloud integration (recommended)
ARTILLERY_KEY=your_artillery_cloud_key_here

# Optional: Override target URL
export ARTILLERY_TARGET=http://your-staging-server:3000

# Optional: Enable debug mode
export DEBUG=artillery:*
```

### Artillery Cloud Setup
1. **Sign up** at https://app.artillery.io/
2. **Get your API key** from the dashboard
3. **Add to .env file**: `ARTILLERY_KEY=your_key_here`
4. **Run tests** - results automatically upload to cloud dashboard

**Cloud features automatically enabled:**
- Tagged test runs for easy filtering
- SLA threshold monitoring with alerts
- Team dashboards and collaboration
- Historical performance trends

### Custom Processor Functions
The `boat-processor.cjs` provides:
- Realistic boat name generation
- User behavior simulation
- Performance tracking
- Error rate monitoring

### Test Data
- `boats.csv`: 25 realistic boat entries
- Covers all boat types and realistic year ranges
- Used for POST operations with realistic data

## 🎯 Best Practices

### Before Running Tests
1. **Seed the database** with initial data:
   ```bash
   npm run seed:boats 100
   ```

2. **Monitor system resources**:
   ```bash
   # System monitoring
   htop
   
   # Database monitoring
   docker stats
   ```

3. **Set up log monitoring**:
   ```bash
   # API logs
   docker-compose logs -f app
   
   # Database logs
   docker-compose logs -f mongodb
   ```

### During Tests
- Monitor application logs for errors
- Watch database connection pools
- Check Elasticsearch cluster health
- Monitor system CPU/memory usage

### After Tests
- Analyze generated reports
- Compare against SLA targets
- Document performance bottlenecks
- Plan optimization strategies

## 🚨 Troubleshooting

### Common Issues

**Connection Refused:**
```bash
# Check if API is running
curl -f http://localhost:3000/ || echo "API not running"

# Check Docker containers
docker-compose ps
```

**High Error Rates:**
- Reduce arrival rate in YAML config
- Increase timeout values
- Check database connection limits
- Monitor Elasticsearch health

**Memory Issues:**
```bash
# Reduce concurrent users
# In YAML files, lower arrivalRate values
phases:
  - duration: 60
    arrivalRate: 10  # Reduced from 30
```

**Elasticsearch Timeouts:**
```bash
# Check ES cluster health
curl http://localhost:9200/_cluster/health
```

## 📋 Reporting Issues

When reporting performance issues, include:
- Test scenario used
- Artillery report JSON
- Application logs
- System resource usage
- Database metrics
- Elasticsearch cluster status

## 🔗 Additional Resources

- [Artillery Documentation](https://artillery.io/docs/)
- [SailingLoc API Documentation](../../docs/API.md)
- [Database Seeding Guide](../../docs/database-seeding.md)