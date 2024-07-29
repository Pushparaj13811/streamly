import Router from "express";
import { getAllLikes, removeLike, like } from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/").post(getAllLikes);

router.route("/like").post(verifyJWT, like);

router.route("/remove-like").delete(verifyJWT, removeLike);

export default router;
