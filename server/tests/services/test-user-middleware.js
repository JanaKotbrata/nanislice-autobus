// injects user id into req.user similar to passport (for test purposes only)
const TestUserMiddleware = (getUserIdCallback) => {
    return (req, res, next) => {
        req.user = req.user || {};
        req.user.id = getUserIdCallback();
        next();
    }
}
module.exports = TestUserMiddleware;