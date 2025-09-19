describe("handleOAuthCallback", () => {
  let req;
  let res;
  beforeEach(() => {
    jest.resetModules();
    req = { user: { id: "user123" } };
    res = { redirect: jest.fn() };
    // Mock createTokenHash

    jest.doMock("../../src/services/token-service", () => ({
      ...jest.requireActual("../../src/services/token-service"),
      createTokenHash: jest.fn(() => Promise.resolve({ hash: "fakehash" })),
    }));
    // Mock jwt.sign

    jest.doMock("jsonwebtoken", () => ({
      ...jest.requireActual("jsonwebtoken"),
      sign: jest.fn(() => "fake-jwt-token"),
    }));
  });

  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("should redirect to auth-callback with token", async () => {
    const {
      handleOAuthCallback,
    } = require("../../src/services/auth/auth-service");
    const Config = require("../../../shared/config/config.json");
    await handleOAuthCallback(req, res);
    expect(res.redirect).toHaveBeenCalledWith(
      `${Config.CLIENT_URI}/auth-callback?token=fake-jwt-token`,
    );
  });

  it("should redirect to auth-callback with token and userId if includeUserId is true", async () => {
    const {
      handleOAuthCallback,
    } = require("../../src/services/auth/auth-service");
    const Config = require("../../../shared/config/config.json");
    await handleOAuthCallback(req, res, { includeUserId: true });
    expect(res.redirect).toHaveBeenCalledWith(
      `${Config.CLIENT_URI}/auth-callback?token=fake-jwt-token&userId=user123`,
    );
  });
});
describe("findOrCreateOAuthUser", () => {
  let usersMock;
  let downloadAvatarMock;
  let userData;

  beforeEach(() => {
    userData = {
      id: "user1",
      email: "test@example.com",
      username: "tester",
      picture: "http://avatar.url/avatar.png",
      discordId: null,
      googleId: null,
      seznamId: null,
      sys: 1,
    };
    usersMock = {
      getByDiscordId: jest.fn(),
      getByGoogleId: jest.fn(),
      getBySeznamId: jest.fn(),
      getByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      getById: jest.fn(),
    };
    downloadAvatarMock = jest.fn();
    jest.resetModules();
    jest.doMock("../../src/services/avatar-service", () => ({
      ...jest.requireActual("../../src/services/avatar-service"),
      downloadAvatar: downloadAvatarMock,
    }));
  });

  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });
  it("should find user by platform ID (googleId) and call downloadAvatar", async () => {
    const profile = {
      id: "google123",
      email: "test@example.com",
      username: "tester",
      avatarUrl: "http://avatar.url/avatar.png",
    };
    const userWithGoogle = {
      ...userData,
      googleId: profile.id,
      picture: profile.avatarUrl,
    };
    usersMock.getByGoogleId.mockResolvedValue(userWithGoogle);
    usersMock.getByEmail.mockResolvedValue(null);
    usersMock.getById.mockResolvedValue(userWithGoogle);

    const {
      findOrCreateOAuthUser,
    } = require("../../src/services/auth/auth-service");
    const result = await findOrCreateOAuthUser({
      users: usersMock,
      platform: "google",
      profile,
    });
    expect(usersMock.getByGoogleId).toHaveBeenCalledWith(profile.id);
    expect(result).toEqual(userWithGoogle);
    const avatarService = require("../../src/services/avatar-service");
    expect(avatarService.downloadAvatar).toHaveBeenCalledWith(
      userWithGoogle.picture,
      userWithGoogle.id,
    );
  });

  it("should create new user if none exists (seznam)", async () => {
    const profile = {
      id: "seznam123",
      email: "test@example.com",
      username: "tester",
      avatarUrl: "http://avatar.url/avatar.png",
    };
    usersMock.getBySeznamId.mockResolvedValue(null);
    usersMock.getByEmail.mockResolvedValue(null);
    const createdUser = {
      ...userData,
      seznamId: profile.id,
      picture: profile.avatarUrl,
    };
    usersMock.create.mockResolvedValue(createdUser);
    usersMock.getById.mockResolvedValue(createdUser);

    const {
      findOrCreateOAuthUser,
    } = require("../../src/services/auth/auth-service");
    const result = await findOrCreateOAuthUser({
      users: usersMock,
      platform: "seznam",
      profile,
    });
    expect(usersMock.create).toHaveBeenCalledWith(
      { seznamId: profile.id },
      profile.email,
      profile.username,
      profile.avatarUrl,
    );
    expect(result).toEqual(createdUser);
    const avatarService = require("../../src/services/avatar-service");
    expect(avatarService.downloadAvatar).toHaveBeenCalledWith(
      createdUser.picture,
      createdUser.id,
    );
  });
  it("should update user with missing platform ID", async () => {
    const profile = {
      id: "discord123",
      email: "test@example.com",
      username: "tester",
      avatarUrl: "http://avatar.url/avatar.png",
    };

    const userNoDiscord = {
      ...userData,
      discordId: null,
      picture: profile.avatarUrl,
    };
    const updatedUser = { ...userNoDiscord, discordId: profile.id };
    usersMock.getByDiscordId.mockResolvedValue(null);
    usersMock.getByEmail.mockResolvedValue(userNoDiscord);
    usersMock.update.mockResolvedValue(updatedUser);
    usersMock.getById.mockResolvedValue(updatedUser);

    usersMock.getById.mockResolvedValue(updatedUser);
    const {
      findOrCreateOAuthUser,
    } = require("../../src/services/auth/auth-service");
    const result = await findOrCreateOAuthUser({
      users: usersMock,
      platform: "discord",
      profile,
    });
    expect(usersMock.update).toHaveBeenCalledWith(
      userNoDiscord.id,
      expect.objectContaining({
        discordId: profile.id,
        sys: userNoDiscord.sys,
      }),
    );
    expect(result).toEqual(updatedUser);
    const avatarService = require("../../src/services/avatar-service");
    expect(avatarService.downloadAvatar).toHaveBeenCalledWith(
      updatedUser.picture,
      updatedUser.id,
    );
  });
  it("should create new user if none exists", async () => {
    const profile = {
      id: "discord123",
      email: "test@example.com",
      username: "tester",
      avatarUrl: "http://avatar.url/avatar.png",
    };
    usersMock.getByDiscordId.mockResolvedValue(null);
    usersMock.getByEmail.mockResolvedValue(null);
    const createdUser = {
      ...userData,
      discordId: profile.id,
      picture: profile.avatarUrl,
    };
    usersMock.create.mockResolvedValue(createdUser);
    usersMock.getById.mockResolvedValue(createdUser);

    usersMock.getById.mockResolvedValue(createdUser);
    const {
      findOrCreateOAuthUser,
    } = require("../../src/services/auth/auth-service");
    const result = await findOrCreateOAuthUser({
      users: usersMock,
      platform: "discord",
      profile,
    });
    expect(usersMock.create).toHaveBeenCalledWith(
      { discordId: profile.id },
      profile.email,
      profile.username,
      profile.avatarUrl,
    );
    expect(result).toEqual(createdUser);
    const avatarService = require("../../src/services/avatar-service");
    expect(avatarService.downloadAvatar).toHaveBeenCalledWith(
      createdUser.picture,
      createdUser.id,
    );
  });
  it("should find user by platform ID (discordId) and call downloadAvatar", async () => {
    const profile = {
      id: "discord123",
      email: "test@example.com",
      username: "tester",
      avatarUrl: "http://avatar.url/avatar.png",
    };
    const userWithDiscord = {
      ...userData,
      discordId: profile.id,
      picture: profile.avatarUrl,
    };
    usersMock.getByDiscordId.mockResolvedValue(userWithDiscord);
    usersMock.getByEmail.mockResolvedValue(null);
    usersMock.getById.mockResolvedValue(userWithDiscord);

    usersMock.getById.mockResolvedValue(userWithDiscord);
    const {
      findOrCreateOAuthUser,
    } = require("../../src/services/auth/auth-service");
    const result = await findOrCreateOAuthUser({
      users: usersMock,
      platform: "discord",
      profile,
    });
    expect(usersMock.getByDiscordId).toHaveBeenCalledWith(profile.id);
    expect(result).toEqual(userWithDiscord);

    const avatarService = require("../../src/services/avatar-service");
    expect(avatarService.downloadAvatar).toHaveBeenCalledWith(
      userWithDiscord.picture,
      userWithDiscord.id,
    );
  });
});
