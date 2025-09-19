// injects user id into req.user similar to passport (for test purposes only)
const TestUserMiddleware = (getIdCallback) => {
  return (req, res, next) => {
    req.user = req.user || {};
    req.user.id = getIdCallback();
    next();
  };
};
module.exports = TestUserMiddleware;
