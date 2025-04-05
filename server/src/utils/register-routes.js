const traverseDirectory = require('./traverse-directory');

function initClass(fullPath, expressApp) {
    const routeHandler = require(fullPath);
    new routeHandler(expressApp);
}

function registerRoutes(directory, expressApp) {
  traverseDirectory(directory,".js", (fullPath)=>initClass(fullPath, expressApp));
}

module.exports = registerRoutes;