const path = require('path');

function getPathFromRoot(directory) {
    return path.resolve(__dirname, "..", directory);
}

module.exports = getPathFromRoot;