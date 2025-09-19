const DiscordStrategy = require("passport-discord").Strategy;
const config = require("../../../config/config.json");
const UsersRepository = require("../../models/users-repository");
const users = new UsersRepository();
const Config = require("../../../../shared/config/config.json");
const {
  findOrCreateOAuthUser,
  handleOAuthCallback,
} = require("./auth-service");

function initDiscordAuth(passport, app) {
  passport.use(
    new DiscordStrategy(
      {
        clientID: config.discord.client_id,
        clientSecret: config.discord.client_secret,
        callbackURL: `${Config.SERVER_URI}/auth/discord/callback`,
        scope: ["identify", "email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        const normalizedProfile = {
          id: profile.id,
          email: profile.email,
          username: profile.username,
          avatarUrl: profile.avatar
            ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
            : null,
        };
        try {
          const user = await findOrCreateOAuthUser({
            users,
            platform: "discord",
            profile: normalizedProfile,
          });
          done(null, user);
        } catch (err) {
          done(err, null);
        }
      },
    ),
  );

  //ROUTES
  app.get(
    "/auth/discord",
    passport.authenticate("discord", { session: false }),
  );

  app.get(
    "/auth/discord/callback",
    passport.authenticate("discord", { session: false, failureRedirect: "/" }),
    (req, res) => handleOAuthCallback(req, res, { includeUserId: true }),
  );
}

module.exports = initDiscordAuth;
