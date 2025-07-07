const fs = require("fs");
const path = require("path");
const { Writable } = require("stream");

/**
 * Stáhne obrázek z URL a uloží ho jako soubor (jpg nebo png)
 * @param {string} url - URL obrázku
 * @param {string} userId - ID uživatele
 * @param {string} [destFolder='./public/avatars']
 */
async function downloadAvatar(url, userId, destFolder = path.resolve(__dirname, '../../avatars')) {
    try {
        if (!fs.existsSync(destFolder)) {
            fs.mkdirSync(destFolder, { recursive: true });
        }
        if (!url) {
            return;
        }

        const files = fs.promises.readdir(destFolder);
        const existingFile = (await files).find(file => file.startsWith(userId + "."));

        if (existingFile) {
            console.log(`Obrázek pro uživatele ${userId} již existuje.`);
            return path.join(destFolder, existingFile);
        }

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Chyba při stahování: ${response.statusText}`);
        }

        const ext = url.includes(".png") ? "png" : "jpg";
        const filePath = path.join(destFolder, `${userId}.${ext}`);

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

module.exports = downloadAvatar;
