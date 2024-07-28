export const addUsernameToParams = (req, res, next) => {
    const username = req.params.username;
    if (req.user && req.user.username) {
        req.params.username = req.user.username;
    }
    next();
};
