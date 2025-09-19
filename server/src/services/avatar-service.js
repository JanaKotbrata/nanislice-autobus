const fs = require("fs");
const path = require("path");
const { Writable } = require("stream");
const getPathFromRoot = require("../utils/get-path-from-root");

const AVATAR_FOLDER = getPathFromRoot("../avatars");
const DEFAULT_AVATAR = path.join(AVATAR_FOLDER, "pig-face.png");

async function getExistingAvatar(userId) {
  const files = await fs.promises.readdir(AVATAR_FOLDER);
  return files.find((file) => file.startsWith(userId + "."));
}

function ensureFolders() {
  if (!fs.existsSync(AVATAR_FOLDER)) {
    fs.mkdirSync(AVATAR_FOLDER, { recursive: true });
  }
}

function getAvatarFilePath(url, userId) {
  const ext = url.includes("png") ? "png" : "jpg";
  return path.join(AVATAR_FOLDER, `${userId}.${ext}`);
}

/**
 * Downloads an image from a URL and saves it as a file (jpg or png)
 * @param {string} url - Image URL
 * @param {string} userId - User ID
 */
async function downloadAvatar(url, userId) {
  try {
    ensureFolders();
    if (!url) {
      return;
    }

    const existingFile = await getExistingAvatar(userId);

    if (existingFile) {
      console.log(`Avatar for user ${userId} already exists.`);
      return path.join(AVATAR_FOLDER, existingFile);
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Download error: ${response.statusText}`);
    }

    const filePath = getAvatarFilePath(url, userId);

    const writer = fs.createWriteStream(filePath);

    return new Promise((resolve, reject) => {
      response.body.pipeTo(Writable.toWeb(writer));
      writer.on("finish", () => resolve(filePath));
      writer.on("error", reject);
    });
  } catch (err) {
    console.error("Error downloading avatar:", err.message);
  }
}

async function storeAvatar(userId, newFileBlob, mimeType) {
  ensureFolders();

  const existingFile = await getExistingAvatar(userId);

  const filePath = getAvatarFilePath(mimeType, userId);

  if (existingFile && !filePath.endsWith(existingFile)) {
    // remove old file
    await fs.promises.rm(path.join(AVATAR_FOLDER, existingFile), {
      force: true,
    });
  }

  await fs.promises.writeFile(filePath, newFileBlob);
}

module.exports = {
  downloadAvatar,
  storeAvatar,
  AVATAR_FOLDER,
  DEFAULT_AVATAR,
  getExistingAvatar,
};
