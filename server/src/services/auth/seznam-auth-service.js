const OAuth2Strategy = require("passport-oauth2");
const config = require("../../../config/config.json");
const UsersRepository = require("../../models/users-repository");
const Config = require("../../../../shared/config/config.json");
const users = new UsersRepository();
const {
  findOrCreateOAuthUser,
  handleOAuthCallback,
} = require("./auth-service");

function initSeznamAuth(passport, app) {
  passport.use(
    "seznam",
    new OAuth2Strategy(
      {
        authorizationURL: "https://login.szn.cz/api/v1/oauth/auth",
        tokenURL: "https://login.szn.cz/api/v1/oauth/token",
        clientID: config.seznam.client_id,
        clientSecret: config.seznam.client_secret,
        callbackURL: `${Config.SERVER_URI}/auth/seznam/callback`,
        scope: "identity",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const userInfoResponse = await fetch(
            "https://login.szn.cz/api/v1/user",
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            },
          );
          const userInfo = await userInfoResponse.json();
          const normalizedProfile = {
            id: userInfo.oauth_user_id,
            email: userInfo.email,
            username: userInfo.firstname + " " + userInfo.lastname,
            avatarUrl: userInfo.avatar_url || null,
          };
          const user = await findOrCreateOAuthUser({
            users,
            platform: "seznam",
            profile: normalizedProfile,
          });
          done(null, user);
        } catch (err) {
          done(err, null);
        }
      },
    ),
  );

  // ROUTES
  app.get("/auth/seznam", passport.authenticate("seznam", { session: false }));

  app.get(
    "/auth/seznam/callback",
    passport.authenticate("seznam", { session: false, failureRedirect: "/" }),
    (req, res) => handleOAuthCallback(req, res),
  );
}

module.exports = initSeznamAuth;
