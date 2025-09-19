const multer = require("multer");
const passport = require("passport");
const upload = multer({ storage: multer.memoryStorage() });

function authenticateJWT(req, res, next) {
  return passport.authenticate("jwt", { session: false })(req, res, next);
}

/**
 * Sjednocený registrátor route handlerů
 * @param {Object} options
 * @param {object} options.expressApp - Express aplikace
 * @param {string} options.method - 'get' nebo 'post'
 * @param {string} options.route - cesta
 * @param {string} options.handler - název metody v this
 * @param {boolean} [options.auth] - zda použít authenticateJWT
 * @param {string} [options.fileInput] - název pole pro upload souboru
 * @param {boolean} [options.json] - zda vracet JSON (true) nebo jen volat handler (false)
 * @param {object} [options.context] - this kontext pro handler
 */
function registerResponseHandler({
  expressApp,
  method,
  route,
  handler,
  auth = false,
  fileInput,
  json = true,
  context,
}) {
  const middlewares = [];
  if (auth) middlewares.push(authenticateJWT);
  if (fileInput) middlewares.push(upload.single(fileInput));
  expressApp[method](route, ...middlewares, async (req, res, next) => {
    try {
      const result = await context[handler](req, res);
      if (json) {
        const withSuccess = { success: true, ...result };
        res.status(200).json(withSuccess);
      }
    } catch (e) {
      next(e);
    }
  });
}

/**
 * Response handler for authenticated GET requests.
 * Registers a GET route requiring JWT authentication.
 * @class
 */
class AuthenticatedGetResponseHandler {
  constructor(expressApp, route, handler) {
    registerResponseHandler({
      expressApp,
      method: "get",
      route,
      handler,
      auth: true,
      json: true,
      context: this,
    });
  }
}
/**
 * Response handler for unauthenticated GET requests.
 * Registers a GET route without authentication.
 * @class
 */
class NotAuthenticatedGetResponseHandler {
  constructor(expressApp, route, handler) {
    registerResponseHandler({
      expressApp,
      method: "get",
      route,
      handler,
      auth: false,
      json: true,
      context: this,
    });
  }
}
/**
 * Response handler for GET requests returning files (no JSON).
 * @class
 */
class GetFileResponseHandler {
  constructor(expressApp, route, handler) {
    registerResponseHandler({
      expressApp,
      method: "get",
      route,
      handler,
      auth: false,
      json: false,
      context: this,
    });
  }
}
/**
 * Response handler for authenticated POST requests.
 * Registers a POST route requiring JWT authentication.
 * @class
 */
class AuthenticatedPostResponseHandler {
  constructor(expressApp, route, handler) {
    registerResponseHandler({
      expressApp,
      method: "post",
      route,
      handler,
      auth: true,
      json: true,
      context: this,
    });
  }
}
/**
 * Response handler for authenticated POST requests with file upload.
 * Registers a POST route requiring JWT authentication and file input.
 * @class
 */
class PostFormDataResponseHandler {
  constructor(expressApp, route, fileInput, handler) {
    registerResponseHandler({
      expressApp,
      method: "post",
      route,
      handler,
      auth: true,
      fileInput,
      json: true,
      context: this,
    });
  }
}

module.exports = {
  AuthenticatedGetResponseHandler,
  AuthenticatedPostResponseHandler,
  GetFileResponseHandler,
  PostFormDataResponseHandler,
  NotAuthenticatedGetResponseHandler,
};
