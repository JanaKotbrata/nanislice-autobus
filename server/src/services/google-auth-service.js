const GoogleStrategy = require('passport-google-oauth20').Strategy;
const config = require('../../config/config.json');
const UsersRepository = require('../models/users-repository');
const jwt = require("jsonwebtoken");
const Config = require("../../../shared/config/config.json");
const users = new UsersRepository();
const {downloadAvatar} = require('../utils/download-image');
const {createTokenHash} = require("./token-service");
const JWT_SECRET = config.secret;

async function initGoogleAuth(passport, app) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: config.google.client_id,
                clientSecret: config.google.client_secret,
                callbackURL: `${Config.SERVER_URI}/auth/google/callback`,
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const existingUser = await users.getUserByGoogleId(profile.id);
                    if (existingUser) {
                        await downloadAvatar(existingUser.picture, existingUser.id);
                        return done(null, existingUser);
                    }
                    //try to find user by email
                    let user = await users.getUserByEmail(profile.emails[0].value);
                    if (!user) {
                        user = await users.createUser({
                                googleId: profile.id
                            },
                            profile.emails[0].value,
                            profile.displayName,
                            profile.photos[0].value,
                        );
                    } else {
                        if (!user.googleId) {
                            user = await users.updateUser(user.id, {googleId: profile.id, sys: user.sys});
                        }
                    }
                    await downloadAvatar(user.picture, user.id);
                    const newUser = await users.getUserById(user.id);
                    done(null, newUser);
                } catch (err) {
                    done(err, null);
                }
            }
        )
    );

    //ROUTES
    app.get('/auth/google', passport.authenticate('google', {session: false, scope: ['profile', 'email']}));

    app.get(
        '/auth/google/callback',
        passport.authenticate('google', { session: false, failureRedirect: '/'}),
        async (req, res) => {
            const {hash} = await createTokenHash(req.user.id);
            const token = jwt.sign({id: req.user.id, loginHash: hash}, JWT_SECRET, {expiresIn: '24h'});
            res.redirect(`${Config.CLIENT_URI}/auth-callback?token=${token}`);
        }
    );
}

module.exports = initGoogleAuth;