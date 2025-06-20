import app from "./app.js";
import { config } from "./config/environment.js";
import prisma from "./config/database.js";
import elasticsearchService from "./services/elasticsearchService.js";
import logger from "./utils/logger.js";

logger.info("App démarrée");

// Initialize Elasticsearch index
async function initializeServices() {
  try {
    await elasticsearchService.initializeIndex();
    logger.success("Elasticsearch initialisé avec succès");
  } catch (error) {
    logger.error("Erreur lors de l'initialisation d'Elasticsearch :", error);
  }
}

const server = app.listen(config.app.port, async () => {
  logger.success(`Serveur démarré sur http://localhost:${config.app.port}`);
  await initializeServices();
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}, starting graceful shutdown...`);

  server.close(() => {
    logger.success("Serveur HTTP fermé.");

    Promise.all([
      prisma.$disconnect()
    ]).then(() => {
      logger.success("Base de données déconnectée.");
      process.exit(0);
    }).catch((err) => {
      logger.error("Error during shutdown:", err);
      process.exit(1);
    });
  });

  // Force close after timeout
  setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));