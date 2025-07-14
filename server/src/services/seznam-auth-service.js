const OAuth2Strategy = require('passport-oauth2');
const config = require('../../config/config.json');
const UsersRepository = require('../models/users-repository');
const jwt = require('jsonwebtoken');
const Config = require('../../../shared/config/config.json');
const {downloadAvatar} = require("../utils/download-image");
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
                        headers: {Authorization: `Bearer ${accessToken}`},
                    });
                    const userInfo = await userInfoResponse.json();
                    let user = await users.getUserByEmail(userInfo.email);
                    if (!user) {
                        user = await users.createUser({
                                seznamId: userInfo.oauth_user_id
                            },
                            userInfo.email,
                            userInfo.firstname + ' ' + userInfo.lastname,
                            userInfo.avatar_url || null,
                        );
                    } else {
                        if (!user.seznamId) {
                            user = await users.updateUser(user.id, {
                                seznamId: userInfo.oauth_user_id,
                                sys: user.sys,
                            });
                        }
                    }
                    await downloadAvatar(user.picture, user.id);
                    done(null, user);
                } catch (err) {
                    done(err, null);
                }
            }
        )
    );

    // ROUTES
    app.get('/auth/seznam', passport.authenticate('seznam', {session: false}));

    app.get(
        '/auth/seznam/callback',
        passport.authenticate('seznam', {session:false,failureRedirect: '/'}),
        (req, res) => {
            const token = jwt.sign({id: req.user.id}, JWT_SECRET, {expiresIn: '24h'});
            res.redirect(`${Config.CLIENT_URI}/auth-callback?token=${token}`);
        }
    );
}

module.exports = initSeznamAuth;