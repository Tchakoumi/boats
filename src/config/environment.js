import dotenv from "dotenv";
dotenv.config();

export const config = {
  app: {
    port: process.env.APP_PORT || 3000,
    env: process.env.NODE_ENV || 'development',
  },
  elasticsearch: {
    url: process.env.ELASTICSEARCH_URL,
  },
  database: {
    url: process.env.DATABASE_URL,
  },
};