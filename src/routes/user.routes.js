import { Router } from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    updateUserAvatar,
    updateUserCoverImage,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyUsername } from "../middlewares/verifyUsername.middleware.js";
import { addUsernameToParams } from "../middlewares/addusernametourl.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,
        },
        {
            name: "coverImage",
            maxCount: 1,
        },
    ]),
    registerUser
);

router.route("/login").post(loginUser);

// secured routes

router.route("/logout").post(verifyJWT, logoutUser);

router.route("/refresh-token").post(refreshAccessToken);

router.route("/me").get(verifyJWT, (req, res) => {
    const username = req.user.username;
    res.redirect(`/me/${username}`);
});

router
    .route(`/me/:username`)
    .get(verifyJWT, addUsernameToParams, verifyUsername, (req, res) => {
        res.json(req.user);
    });

router
    .route("/me/:username/update-avatar")
    .patch(
        verifyJWT,
        addUsernameToParams,
        verifyUsername,
        upload.single("avatar"),
        updateUserAvatar
    );

router
    .route("/me/:username/update-cover-image")
    .patch(
        verifyJWT,
        addUsernameToParams,
        verifyUsername,
        upload.single("coverImage"),
        updateUserCoverImage
    );
export default router;
