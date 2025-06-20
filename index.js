import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { PrismaClient } from "@prisma/client";
import elasticsearchService from "./elasticsearch.js";

console.log("🚀 App démarrée");

const app = express();
const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

app.use(express.json());

app.get("/", async (req, res) => {
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
});

app.post("/boats", async (req, res) => {
  const { name, type, year } = req.body;
  try {
    const boat = await prisma.Boat.create({
      data: { name, type, year: parseInt(year) },
    });

    // Index the boat in Elasticsearch
    await elasticsearchService.indexBoat(boat);

    res.status(201).json(boat);
  } catch (error) {
    console.error("Erreur :", error);
    res.status(500).json({ error: "Erreur lors de la création du bateau" });
  }
});

app.get("/boats", async (req, res) => {
  try {
    const boats = await prisma.Boat.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        year: true,
      },
    });
    res.json(boats);
  } catch (error) {
    console.error("Erreur lors de la récupération des bateaux :", error);
    res.status(500).json({ error: "Impossible de récupérer les bateaux" });
  }
});

app.put("/boats/:id", async (req, res) => {
  const { id } = req.params;
  const { name, type, year } = req.body;

  try {
    const boat = await prisma.Boat.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(type && { type }),
        ...(year && { year: parseInt(year) }),
      },
    });

    // Update the boat in Elasticsearch
    await elasticsearchService.updateBoat(boat);

    res.json(boat);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du bateau :", error);
    if (error.meta.body.status === 404) {
      res.status(404).json({ error: "Bateau non trouvé" });
    } else {
      res.status(500).json({
        error: `Erreur lors de la mise à jour du bateau`,
      });
    }
  }
});

app.delete("/boats/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.Boat.delete({
      where: { id },
    });

    // Delete the boat from Elasticsearch
    await elasticsearchService.deleteBoat(id);

    res.status(204).send();
  } catch (error) {
    console.error("Erreur lors de la suppression du bateau :", error);
    if (error.code === "P2025") {
      res.status(404).json({ error: "Bateau non trouvé" });
    } else {
      res
        .status(500)
        .json({ error: "Erreur lors de la suppression du bateau" });
    }
  }
});

// Search boats endpoint
app.get("/boats/search", async (req, res) => {
  try {
    const { q, type, year, yearMin, yearMax } = req.query;

    const filters = {};
    if (type) filters.type = type;
    if (year) filters.year = parseInt(year);
    if (yearMin || yearMax) {
      filters.yearRange = {};
      if (yearMin) filters.yearRange.min = parseInt(yearMin);
      if (yearMax) filters.yearRange.max = parseInt(yearMax);
    }

    const results = await elasticsearchService.searchBoats(q, filters);
    res.json(results);
  } catch (error) {
    console.error("Erreur lors de la recherche :", error);
    res.status(500).json({ error: "Erreur lors de la recherche de bateaux" });
  }
});

// Elasticsearch health endpoint
app.get("/elasticsearch/health", async (req, res) => {
  try {
    const health = await elasticsearchService.getHealth();
    res.json(health);
  } catch (error) {
    console.error("Erreur lors de la vérification d'Elasticsearch :", error);
    res
      .status(500)
      .json({ error: "Erreur lors de la vérification d'Elasticsearch" });
  }
});

// Initialize Elasticsearch index
async function initializeServices() {
  try {
    await elasticsearchService.initializeIndex();
    console.log("🔍 Elasticsearch initialisé avec succès");
  } catch (error) {
    console.error(
      "❌ Erreur lors de l'initialisation d'Elasticsearch :",
      error
    );
  }
}

const server = app.listen(process.env.APP_PORT || 3000, async () => {
  console.log(`Serveur démarré sur http://localhost:${process.env.APP_PORT || 3000}`);
  await initializeServices();
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("🔄 Arrêt graceful...");
  server.close(() => {
    console.log("✅ Serveur HTTP fermé.");
    prisma.$disconnect().then(() => {
      console.log("✅ Base de données déconnectée.");
      process.exit(0);
    });
  });
});

process.on("SIGINT", async () => {
  console.log("🔄 Arrêt graceful...");
  server.close(() => {
    console.log("✅ Serveur HTTP fermé.");
    prisma.$disconnect().then(() => {
      console.log("✅ Base de données déconnectée.");
      process.exit(0);
    });
  });
});
