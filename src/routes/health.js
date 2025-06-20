import { Router } from "express";
import { getAppHealth, getElasticsearchHealth } from "../controllers/healthController.js";

const router = Router();

router.get("/", getAppHealth);
router.get("/elasticsearch", getElasticsearchHealth);

export default router;