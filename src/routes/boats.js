import { Router } from "express";
import {
  createBoat,
  getAllBoats,
  updateBoat,
  deleteBoat,
  searchBoats,
} from "../controllers/boatController.js";
import { validateBoat, validateBoatUpdate } from "../middleware/validation.js";

const router = Router();

// Search endpoint should come before :id parameter route to avoid conflicts
router.get("/search", searchBoats);
router.post("/", validateBoat, createBoat);
router.get("/", getAllBoats);
router.put("/:id", validateBoatUpdate, updateBoat);
router.delete("/:id", deleteBoat);

export default router;