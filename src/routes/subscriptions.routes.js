import { Router } from "express";
import {
    subscribe,
    unsubscribe,
    checkSubscription,
} from "../controllers/subscriber.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/checkSubscription/:channelId",verifyJWT, checkSubscription);
router.post("/:channelId",verifyJWT, subscribe);
router.delete("/unsubscribe/:channelId",verifyJWT, unsubscribe);

export default router;
