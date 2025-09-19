const fs = require("fs");
const path = require("path");
const { Readable } = require("stream");
const {
  downloadAvatar,
  AVATAR_FOLDER,
} = require("../../src/services/avatar-service");

describe("downloadAvatar", () => {
  const userId = "testuserid";
  const avatarPathPng = path.join(AVATAR_FOLDER, `${userId}.png`);
  const avatarPathJpg = path.join(AVATAR_FOLDER, `${userId}.jpg`);
  const testImageBuffer = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  ]); // PNG header
  let originalFetch;

  beforeAll(() => {
    // Uložíme původní fetch, pokud existuje
    originalFetch = global.fetch;
  });

  afterEach(async () => {
    // Smažeme testovací soubory, pokud existují
    if (fs.existsSync(avatarPathPng)) await fs.promises.unlink(avatarPathPng);
    if (fs.existsSync(avatarPathJpg)) await fs.promises.unlink(avatarPathJpg);
    // Obnovíme fetch po každém testu
    global.fetch = originalFetch;
  });

  it("should download and save avatar from URL (png)", async () => {
    // Mock fetch vrací stream s testovacím PNG obsahem


    // Create a mock stream with .pipeTo for compatibility with Writable.toWeb
    const mockStream = Readable.from(testImageBuffer);
    mockStream.pipeTo = async function(dest) {
      // Simulate writing all data and finishing
      if (typeof dest.getWriter === 'function') {
        const writer = dest.getWriter();
        for await (const chunk of this) {
          await writer.write(chunk);
        }
        await writer.close();
      } else {
        // fallback for non-web streams
        this.pipe(dest);
      }
      return Promise.resolve();
    };

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        body: mockStream,
        status: 200,
        statusText: "OK",
      }),
    );

    const url = "https://example.com/avatar.png";
    const filePath = await downloadAvatar(url, userId);
    expect(filePath.endsWith(`${userId}.png`)).toBe(true);
    expect(fs.existsSync(filePath)).toBe(true);
    const fileContent = await fs.promises.readFile(filePath);
    expect(Buffer.compare(fileContent, testImageBuffer)).toBe(0);
  });

  it("should not download again if avatar already exists", async () => {
    // Vytvoříme soubor, který simuluje existující avatar
    await fs.promises.writeFile(avatarPathPng, testImageBuffer);
    // Mock fetch by selhal, pokud by byl volán
    global.fetch = jest.fn(() => {
      throw new Error("Nemělo by být voláno fetch!");
    });
    const url = "https://example.com/avatar.png";
    const filePath = await downloadAvatar(url, userId);
    expect(filePath).toBe(avatarPathPng);
    expect(fs.existsSync(filePath)).toBe(true);
    const fileContent = await fs.promises.readFile(filePath);
    expect(Buffer.compare(fileContent, testImageBuffer)).toBe(0);
  });

  it("should handle fetch failure (bad response)", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        statusText: "Not Found",
      }),
    );
    const url = "https://example.com/nonexistent.png";
    const result = await downloadAvatar(url, userId);
    expect(result).toBeUndefined();
    expect(fs.existsSync(avatarPathPng)).toBe(false);
  });
});
