import boatService from "../services/boatService.js";

export const createBoat = async (req, res) => {
  try {
    const boat = await boatService.createBoat(req.body);
    res.status(201).json(boat);
  } catch (error) {
    console.error("Erreur :", error);
    res.status(500).json({ error: "Erreur lors de la création du bateau" });
  }
};

export const getAllBoats = async (req, res) => {
  try {
    const boats = await boatService.getAllBoats();
    res.json(boats);
  } catch (error) {
    console.error("Erreur lors de la récupération des bateaux :", error);
    res.status(500).json({ error: "Impossible de récupérer les bateaux" });
  }
};

export const updateBoat = async (req, res) => {
  const { id } = req.params;

  try {
    const boat = await boatService.updateBoat(id, req.body);
    res.json(boat);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du bateau :", error);
    if (error.meta?.body?.status === 404) {
      res.status(404).json({ error: "Bateau non trouvé" });
    } else {
      res.status(500).json({
        error: "Erreur lors de la mise à jour du bateau",
      });
    }
  }
};

export const deleteBoat = async (req, res) => {
  const { id } = req.params;

  try {
    await boatService.deleteBoat(id);
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
};

export const searchBoats = async (req, res) => {
  try {
    const { q, type, year, yearMin, yearMax } = req.query;
    const results = await boatService.searchBoats(q, { type, year, yearMin, yearMax });
    res.json(results);
  } catch (error) {
    console.error("Erreur lors de la recherche :", error);
    res.status(500).json({ error: "Erreur lors de la recherche de bateaux" });
  }
};