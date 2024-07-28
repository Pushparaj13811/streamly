import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
    createVideo,
    getAllVideo,
    getVideoById,
    deleteVideo,
    updateVideo,
    togglePublishedVideo,
} from "../controllers/video.contoller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/").get(getAllVideo);
router.route("/:id").get(getVideoById);
router.route("/upload-video").post(
    verifyJWT,
    upload.fields([
        {
            name: "video",
            maxCount: 1,
        },
        {
            name: "thumbnail",
            maxCount: 1,
        },
    ]),
    createVideo
);


router.route("/delete-video/:id").delete(verifyJWT, deleteVideo);
router.route("/update-video-details/:id").put(verifyJWT, updateVideo);
router.route("/toggle-publish-video/:id").put(verifyJWT, togglePublishedVideo);

export default router;
