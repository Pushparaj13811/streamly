export const verifyUsername = (req, res, next) => {
    const usernameInUrl = req.params?.username.toLowerCase();

    const usernameFromJWT = req.user?.username;

    if (usernameInUrl !== usernameFromJWT) {
        return res
            .status(403)
            .json({ message: "Forbidden: Usernames do not match" });
    }

    next();
};
