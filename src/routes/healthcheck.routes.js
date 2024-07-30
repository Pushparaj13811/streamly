import Router from "express";
import {
    healthCheck,
    getSystemMetrics,
} from "../controllers/healthcheck.controller.js";

const router = Router();

router.route("/healthCheck").get(healthCheck);
router.route("/systemMetrics").get(getSystemMetrics);

export default router;
