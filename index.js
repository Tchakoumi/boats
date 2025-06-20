import express from "express";
import { PrismaClient } from "@prisma/client";

console.log("🚀 App démarrée");

const app = express();
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

app.use(express.json());

app.get("/", async (req, res) => {
  try {
    await prisma.$connect();

    // Test database connection with a simple query
    const result = await prisma.$runCommandRaw({
      ping: 1
    });

    res.json({
      message: "Connexion OK à Mongo via Prisma !",
      database: "Connected",
      ping: result,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("Database connection error:", err);
    res.status(500).json({
      error: "Connexion échouée",
      details: err.message,
      code: err.code,
      timestamp: new Date().toISOString()
    });
  }
});


app.post("/boats", async (req, res) => {
  const { name, type, year } = req.body;
  try {
    const boat = await prisma.Boat.create({
      data: { name, type, year: parseInt(year) },
    });
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
        year: true
      }
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
        ...(year && { year: parseInt(year) })
      },
    });
    res.json(boat);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du bateau :", error);
    if (error.code === 'P2025') {
      res.status(404).json({ error: "Bateau non trouvé" });
    } else {
      res.status(500).json({ error: "Erreur lors de la mise à jour du bateau" });
    }
  }
});

app.delete("/boats/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.Boat.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    console.error("Erreur lors de la suppression du bateau :", error);
    if (error.code === 'P2025') {
      res.status(404).json({ error: "Bateau non trouvé" });
    } else {
      res.status(500).json({ error: "Erreur lors de la suppression du bateau" });
    }
  }
});

const server = app.listen(3000, () => {
  console.log("Serveur démarré sur http://localhost:3000");
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🔄 Arrêt graceful...');
  server.close(() => {
    console.log('✅ Serveur HTTP fermé.');
    prisma.$disconnect().then(() => {
      console.log('✅ Base de données déconnectée.');
      process.exit(0);
    });
  });
});

process.on('SIGINT', async () => {
  console.log('🔄 Arrêt graceful...');
  server.close(() => {
    console.log('✅ Serveur HTTP fermé.');
    prisma.$disconnect().then(() => {
      console.log('✅ Base de données déconnectée.');
      process.exit(0);
    });
  });
});
