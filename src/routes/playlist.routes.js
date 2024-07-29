import Router from "express";
import {
    createPlaylist,
    getPlaylist,
    addVideoToPlaylist,
    deleteVideoFromPlaylist,
    deletePlaylist,
} from "../controllers/playlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/").post(verifyJWT, createPlaylist);
router.route("/get-playlist/:playlistId").get(getPlaylist);
router.route("/add-videos/:playlistId").patch(verifyJWT, addVideoToPlaylist);
router
    .route("/delete-videos/:playlistId")
    .delete(verifyJWT, deleteVideoFromPlaylist);
router.route("/delete-playlist/:playlistId").delete(verifyJWT, deletePlaylist);

export default router;
