import dotenv from "dotenv";
dotenv.config();
import { Client } from "@elastic/elasticsearch";

const ELASTICSEARCH_URL = process.env.ELASTICSEARCH_URL;
const INDEX_NAME = "boats";

class ElasticsearchService {
  constructor() {
    this.client = new Client({ node: ELASTICSEARCH_URL });
  }

  async initializeIndex() {
    try {
      const exists = await this.client.indices.exists({ index: INDEX_NAME });

      if (!exists) {
        await this.client.indices.create({
          index: INDEX_NAME,
          body: {
            mappings: {
              properties: {
                id: { type: "keyword" },
                name: {
                  type: "text",
                  analyzer: "standard",
                  fields: {
                    keyword: { type: "keyword" },
                  },
                },
                type: {
                  type: "text",
                  analyzer: "standard",
                  fields: {
                    keyword: { type: "keyword" },
                  },
                },
                year: { type: "integer" },
                created_at: { type: "date" },
                updated_at: { type: "date" },
              },
            },
          },
        });
        console.log("✅ Elasticsearch index created successfully");
      } else {
        console.log("📋 Elasticsearch index already exists");
      }
    } catch (error) {
      console.error("❌ Error initializing Elasticsearch index:", error);
      throw error;
    }
  }

  async indexBoat(boat) {
    try {
      await this.client.index({
        index: INDEX_NAME,
        id: boat.id,
        body: {
          ...boat,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
      console.log(`🔍 Boat indexed: ${boat.name}`);
    } catch (error) {
      console.error("❌ Error indexing boat:", error);
      throw error;
    }
  }

  async updateBoat(boat) {
    try {
      await this.client.update({
        index: INDEX_NAME,
        id: boat.id,
        body: {
          doc: {
            ...boat,
            updated_at: new Date(),
          },
        },
      });
      console.log(`🔄 Boat updated in index: ${boat.name}`);
    } catch (error) {
      console.error("❌ Error updating boat in index:", error);
      throw error;
    }
  }

  async deleteBoat(boatId) {
    try {
      await this.client.delete({
        index: INDEX_NAME,
        id: boatId,
      });
      console.log(`🗑️ Boat deleted from index: ${boatId}`);
    } catch (error) {
      console.error("❌ Error deleting boat from index:", error);
      throw error;
    }
  }

  async searchBoats(query, filters = {}) {
    try {
      const searchBody = {
        query: {
          bool: {
            must: [],
            filter: [],
          },
        },
        size: 50,
        sort: [
          { _score: { order: "desc" } },
          { "name.keyword": { order: "asc" } },
        ],
      };

      // Add text search query if provided
      if (query && query.trim()) {
        searchBody.query.bool.must.push({
          multi_match: {
            query: query,
            fields: ["name^2", "type"],
            type: "best_fields",
            fuzziness: "AUTO",
          },
        });
      } else {
        searchBody.query.bool.must.push({ match_all: {} });
      }

      // Add filters
      if (filters.type) {
        searchBody.query.bool.filter.push({
          term: { "type.keyword": filters.type },
        });
      }

      if (filters.year) {
        searchBody.query.bool.filter.push({
          term: { year: filters.year },
        });
      }

      if (filters.yearRange) {
        const range = {};
        if (filters.yearRange.min) range.gte = filters.yearRange.min;
        if (filters.yearRange.max) range.lte = filters.yearRange.max;
        searchBody.query.bool.filter.push({
          range: { year: range },
        });
      }

      const response = await this.client.search({
        index: INDEX_NAME,
        body: searchBody,
      });

      return {
        total: response.hits.total.value,
        boats: response.hits.hits.map((hit) => ({
          ...hit._source,
          _score: hit._score,
        })),
      };
    } catch (error) {
      console.error("❌ Error searching boats:", error);
      throw error;
    }
  }

  async getHealth() {
    try {
      const health = await this.client.cluster.health();
      return {
        status: health.status,
        cluster_name: health.cluster_name,
        number_of_nodes: health.number_of_nodes,
        active_primary_shards: health.active_primary_shards,
        active_shards: health.active_shards,
      };
    } catch (error) {
      console.error("❌ Error getting Elasticsearch health:", error);
      throw error;
    }
  }
}

export default new ElasticsearchService();
