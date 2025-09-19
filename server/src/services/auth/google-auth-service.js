const GoogleStrategy = require("passport-google-oauth20").Strategy;
const config = require("../../../config/config.json");
const UsersRepository = require("../../models/users-repository");
const users = new UsersRepository();
const Config = require("../../../../shared/config/config.json");
const {
  findOrCreateOAuthUser,
  handleOAuthCallback,
} = require("./auth-service");

function initGoogleAuth(passport, app) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.google.client_id,
        clientSecret: config.google.client_secret,
        callbackURL: `${Config.SERVER_URI}/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        const normalizedProfile = {
          id: profile.id,
          email:
            profile.emails && profile.emails[0]
              ? profile.emails[0].value
              : null,
          username: profile.displayName,
          avatarUrl:
            profile.photos && profile.photos[0]
              ? profile.photos[0].value
              : null,
        };
        try {
          const user = await findOrCreateOAuthUser({
            users,
            platform: "google",
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
    "/auth/google",
    passport.authenticate("google", {
      session: false,
      scope: ["profile", "email"],
    }),
  );

  app.get(
    "/auth/google/callback",
    passport.authenticate("google", { session: false, failureRedirect: "/" }),
    (req, res) => handleOAuthCallback(req, res),
  );
}

module.exports = initGoogleAuth;
