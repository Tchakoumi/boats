import { Router } from "express";
import boatRoutes from "./boats.js";
import healthRoutes from "./health.js";

const router = Router();

// Health routes (root level for backwards compatibility)
router.use("/", healthRoutes);

// Boat routes
router.use("/boats", boatRoutes);

// Elasticsearch specific health route
router.use("/elasticsearch", healthRoutes);

export default router;