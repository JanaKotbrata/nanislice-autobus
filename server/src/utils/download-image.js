const fs = require("fs");
const path = require("path");
const { Writable } = require("stream");

const AVATAR_FOLDER = path.resolve(__dirname, '../../avatars')

async function getExistingAvatar(userId) {
    const files = await fs.promises.readdir(AVATAR_FOLDER);
    return files.find(file => file.startsWith(userId + "."));
}

function ensureFolders() {
    if (!fs.existsSync(AVATAR_FOLDER)) {
        fs.mkdirSync(AVATAR_FOLDER, { recursive: true });
    }
}

/**
 * Stáhne obrázek z URL a uloží ho jako soubor (jpg nebo png)
 * @param {string} url - URL obrázku
 * @param {string} userId - ID uživatele
 */
async function downloadAvatar(url, userId, ) {
    try {
        ensureFolders();
        if (!url) {
            return;
        }

        const existingFile = await getExistingAvatar(userId);

        if (existingFile) {
            console.log(`Obrázek pro uživatele ${userId} již existuje.`);
            return path.join(AVATAR_FOLDER, existingFile);
        }

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Chyba při stahování: ${response.statusText}`);
        }

        const ext = url.includes(".png") ? "png" : "jpg";
        const filePath = path.join(AVATAR_FOLDER, `${userId}.${ext}`);

        const writer = fs.createWriteStream(filePath);

        return new Promise((resolve, reject) => {
            response.body.pipeTo(Writable.toWeb(writer));
            writer.on("finish", () => resolve(filePath));
            writer.on("error", reject);
        });
    } catch (err) {
        console.error("Chyba při stahování obrázku:", err.message);
    }
}

async function storeAvatar(userId, newFileBlob, mimeType) {
    ensureFolders();

    const existingFile = await getExistingAvatar(userId);

    const ext = mimeType.includes("png") ? "png" : "jpg";
    const filePath = path.join(AVATAR_FOLDER, `${userId}.${ext}`);

    if (!filePath.endsWith(existingFile)) {
        // remove old file
        await fs.promises.rm(path.join(AVATAR_FOLDER, existingFile), { force: true })
    }

    await fs.promises.writeFile(filePath, newFileBlob);
}

module.exports = {
    downloadAvatar,
    storeAvatar,
};
