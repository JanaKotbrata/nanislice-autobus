const DiscordStrategy = require('passport-discord').Strategy;
const config = require('../../config/config.json');
const UsersRepository = require('../models/users-repository');
const users = new UsersRepository();
const jwt = require('jsonwebtoken');
const Config = require("../../../shared/config/config.json");
const downloadAvatar = require("../utils/download-image");
const JWT_SECRET = config.secret;

async function initDiscordAuth(passport, app) {
    passport.use(
        new DiscordStrategy(
            {
                clientID: config.discord.client_id,
                clientSecret: config.discord.client_secret,
                callbackURL: `${Config.SERVER_URI}/auth/discord/callback`,
                scope: ['identify', 'email'],
            },
            async (accessToken, refreshToken, profile, done) => {
                const existingUser = await users.getUserByDiscordId(profile.id);
                if (existingUser) {
                    await downloadAvatar(existingUser.picture, existingUser.id);
                    return done(null, existingUser);
                }
                //try to find user by email
                let user = await users.getUserByEmail(profile.email);
                if (!user) {
                    user = await users.createUser({
                            discordId: profile.id,
                        },
                        profile.email,
                        profile.username
                    );
                } else {
                    if (!user.discordId) {
                        user = await users.updateUser(user.id, {discordId: profile.id, sys: user.sys});
                    }
                }
                await downloadAvatar(user.picture, user.id);
                const newUser = await users.getUserById(user.id);
                done(null, newUser);
            }
        )
    );

    //ROUTES
    app.get('/auth/discord', passport.authenticate('discord'));


    app.get(
        '/auth/discord/callback',
        passport.authenticate('discord', {failureRedirect: '/'}),
        (req, res) => {
            const token = jwt.sign({id: req.user.id}, JWT_SECRET, {expiresIn: '24h'});
            const userId = req.user.id;
            res.redirect(`${Config.CLIENT_URI}/auth-callback?token=${token}&userId=${userId}`);
        }
    );
}

module.exports = initDiscordAuth;