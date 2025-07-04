const OAuth2Strategy = require('passport-oauth2');
const config = require('../../config/config.json');
const UsersRepository = require('../models/users-repository');
const jwt = require('jsonwebtoken');
const Config = require('../../../shared/config/config.json');
const users = new UsersRepository();
const JWT_SECRET = config.secret;

async function initSeznamAuth(passport, app) {
    passport.use(
        'seznam',
        new OAuth2Strategy(
            {
                authorizationURL: 'https://login.szn.cz/api/v1/oauth/auth',
                //authorizationURL: 'http://localhost:1222/api/v1/oauth/auth',
                tokenURL: 'https://login.szn.cz/api/v1/oauth/token',
                clientID: config.seznam.client_id,
                clientSecret: config.seznam.client_secret,
                callbackURL: `${Config.SERVER_URI}/auth/seznam/callback`,
                scope: 'identity',
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const userInfoResponse = await fetch('https://login.szn.cz/api/v1/user', {
                        headers: { Authorization: `Bearer ${accessToken}` },
                    });
                    const userInfo = await userInfoResponse.json();
                    const existingUser = await users.getUserByEmail(userInfo.email);
                    if (existingUser) return done(null, existingUser);

                    const newUser = await users.createUser({
                        seznamId: userInfo.oauth_user_id,
                        email: userInfo.email,
                        name: userInfo.firstname + ' ' + userInfo.lastname,
                        picture: userInfo.avatar_url || null,
                        level: 0,
                    });

                    done(null, newUser);
                } catch (err) {
                    done(err, null);
                }
            }
        )
    );

    // ROUTES
    app.get('/auth/seznam', passport.authenticate('seznam'));

    app.get(
        '/auth/seznam/callback',
        passport.authenticate('seznam', { failureRedirect: '/' }),
        (req, res) => {
            const token = jwt.sign({ id: req.user.id }, JWT_SECRET, { expiresIn: '24h' });
            res.redirect(`${Config.CLIENT_URI}/auth-callback?token=${token}`);
        }
    );
}

module.exports = initSeznamAuth;