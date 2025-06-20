const traverseDirectory = require('./traverse-directory');

function initClass(fullPath, expressApp, io) {
    const routeHandler = require(fullPath);
    new routeHandler(expressApp, io);
}

function registerRoutes(directory, expressApp, io) {
  traverseDirectory(directory,".js", (fullPath)=>initClass(fullPath, expressApp, io));
}

module.exports = registerRoutes;