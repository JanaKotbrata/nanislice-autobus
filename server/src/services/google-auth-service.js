const GoogleStrategy = require('passport-google-oauth20').Strategy;
const config = require('../../config/config.json');
const users = require('../models/users-repository');

async function initGoogleAuth(passport, app) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: config.google.client_id,
                clientSecret: config.google.client_secret,
                callbackURL: `http://localhost:${config.port}/auth/google/callback`, //FIXME for the cloud
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const existingUser = await users.getUserByGoogleId(profile.id);
                    if (existingUser) return done(null, existingUser);
                    //try to find user by email
                    let user = await users.getUserByEmail(profile.emails[0].value);
                    let what;
                    if (!user) {
                        user = await users.createUser({
                            googleId: profile.id,
                            email: profile.emails[0].value,
                            name: profile.displayName,
                            picture: profile.photos[0].value,
                        });
                    } else {
                        what = await users.updateUser(user._id, {googleId: profile.id});
                    }
                    const newUser = await users.getUserById(user._id);
                    done(null, newUser);
                } catch (err) {
                    done(err, null);
                }
            }
        )
    );

    //ROUTES
    app.get('/', (req, res) => res.send('Hlavní stránka'));

    app.get('/auth/google', passport.authenticate('google', {scope: ['profile', 'email']}));

    app.get(
        '/auth/google/callback',
        passport.authenticate('google', {failureRedirect: '/'}),
        (req, res) => {
            res.send('Google Successful!');
        }
    );
}

module.exports = initGoogleAuth;