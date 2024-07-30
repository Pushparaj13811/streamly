import { Router } from "express";
import {
    getUserOverview,
    getEngagementMetrix,
    getPlaylistOverview,
    getVideoOverview,
} from "../controllers/dashboard.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/overview").get(getUserOverview);
router.route("/engagement").get(verifyJWT, getEngagementMetrix);
router.route("/playlists").get(verifyJWT, getPlaylistOverview);
router.route("/videos").get(verifyJWT, getVideoOverview);

export default router;
