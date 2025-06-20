import prisma from "../config/database.js";
import elasticsearchService from "../services/elasticsearchService.js";

export const getAppHealth = async (req, res) => {
  try {
    await prisma.$connect();

    // Test database connection with a simple query
    const mongoResult = await prisma.$runCommandRaw({
      ping: 1,
    });

    // Test Elasticsearch connection
    const elasticsearchHealth = await elasticsearchService.getHealth();

    res.json({
      message: "Connexion OK à Mongo et Elasticsearch !",
      database: "Connected",
      mongoPing: mongoResult,
      elasticsearch: elasticsearchHealth,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Database connection error:", err);
    res.status(500).json({
      error: "Connexion échouée",
      details: err.message,
      code: err.code,
      timestamp: new Date().toISOString(),
    });
  }
};

export const getElasticsearchHealth = async (req, res) => {
  try {
    const health = await elasticsearchService.getHealth();
    res.json(health);
  } catch (error) {
    console.error("Erreur lors de la vérification d'Elasticsearch :", error);
    res
      .status(500)
      .json({ error: "Erreur lors de la vérification d'Elasticsearch" });
  }
};