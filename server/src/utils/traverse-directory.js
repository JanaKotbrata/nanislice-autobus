const fs = require('fs');
const path = require('path');

function traverseDirectory(directory, endsWith, callback) {
    fs.readdirSync(directory).forEach(file => {
        const fullPath = path.join(directory, file);
        if (fs.statSync(fullPath).isDirectory()) {
            traverseDirectory(fullPath, endsWith, callback);
        } else if (file.endsWith(endsWith)) {
            callback(fullPath);
        }
    });
}

module.exports = traverseDirectory;