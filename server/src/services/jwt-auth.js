const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const config = require("../../config/config.json");
const usersRepository = require('../models/users-repository');
const users = new usersRepository();
function initJwtStrategy(passport){
    const opts = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: config.secret,
    };

    passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
        try {
            const user = await users.getUserById(jwt_payload.id);
            // TODO nacist loginHash z tokenu, srovnat s hashem v tabulce v db
            if (user) return done(null, user);
            return done(null, false);
        } catch (err) {
            return done(err, false);
        }
    }));
}
module.exports = {initJwtStrategy};