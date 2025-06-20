import { Client } from '@elastic/elasticsearch';

const ELASTICSEARCH_URL = process.env.ELASTICSEARCH_URL || 'http://localhost:9200';
const MAX_RETRIES = 30;
const RETRY_DELAY = 2000; // 2 seconds

const client = new Client({ node: ELASTICSEARCH_URL });

async function waitForElasticsearch() {
  console.log('🔍 Waiting for Elasticsearch to be ready...');

  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const health = await client.cluster.health();
      if (health.status === 'green' || health.status === 'yellow') {
        console.log('✅ Elasticsearch is ready!');
        console.log(`📊 Cluster status: ${health.status}`);
        return true;
      }
    } catch (error) {
      console.log(`⏳ Attempt ${i + 1}/${MAX_RETRIES}: Elasticsearch not ready yet...`);
      if (i === MAX_RETRIES - 1) {
        console.error('❌ Failed to connect to Elasticsearch after maximum retries');
        console.error('Error details:', error.message);
        process.exit(1);
      }
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }
}

waitForElasticsearch().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});