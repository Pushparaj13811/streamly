export const addUsernameToParams = (req, res, next) => {
    if (req.user && req.user.username) {
        req.params.username = req.user.username;
    }
    next();
};
