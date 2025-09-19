const traverseDirectory = require("./traverse-directory");

/**
 * Initializes a route handler class with the given Express app and socket.io instance.
 * @param {string} fullPath - Full path to the route handler file
 * @param {object} expressApp - Express application instance
 * @param {object} io - Socket.io instance
 */
function initClass(fullPath, expressApp, io) {
  const routeHandler = require(fullPath);
  new routeHandler(expressApp, io);
}

/**
 * Registers all route handler classes in the given directory with the Express app and socket.io.
 * @param {string} directory - Path to the directory containing route handlers
 * @param {object} expressApp - Express application instance
 * @param {object} io - Socket.io instance
 */
function registerRoutes(directory, expressApp, io) {
  traverseDirectory(directory, ".js", (fullPath) =>
    initClass(fullPath, expressApp, io),
  );
}

module.exports = registerRoutes;
