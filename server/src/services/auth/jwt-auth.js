const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const config = require("../../../config/config.json");
const usersRepository = require("../../models/users-repository");
const tokenHashRepository = require("../../models/token-hash-repository");
const users = new usersRepository();
const tokenHash = new tokenHashRepository();
/**
 * Initializes the JWT authentication strategy for Passport.js.
 * @param {object} passport - The Passport.js instance
 */
function initJwtStrategy(passport) {
  const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.secret,
  };

  passport.use(
    new JwtStrategy(opts, async (jwt_payload, done) => {
      try {
        const user = await users.getById(jwt_payload.id);
        const hash = await tokenHash.getByIdAndHash(
          jwt_payload.id,
          jwt_payload.loginHash,
        );
        if (user && hash) {
          user.loginHash = hash;
          return done(null, user);
        }
        return done(null, false);
      } catch (err) {
        return done(err, false);
      }
    }),
  );
}
module.exports = { initJwtStrategy };
