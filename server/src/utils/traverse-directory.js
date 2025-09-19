const fs = require("fs");
const path = require("path");

/**
 * Recursively traverses a directory and calls a callback for each file matching the suffix.
 * @param {string} directory - Directory to traverse
 * @param {string} endsWith - File suffix to match (e.g., '.js')
 * @param {function} callback - Function to call with the full path of each matching file
 */
function traverseDirectory(directory, endsWith, callback) {
  fs.readdirSync(directory).forEach((file) => {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverseDirectory(fullPath, endsWith, callback);
    } else if (file.endsWith(endsWith)) {
      callback(fullPath);
    }
  });
}

module.exports = traverseDirectory;
