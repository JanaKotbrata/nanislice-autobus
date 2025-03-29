const DiscordStrategy = require('passport-discord').Strategy;
const config = require('../../config/config.json');
const users = require('../models/users-repository');
const passport = require("passport");

async function initDiscordAuth(passport, app) {
    passport.use(
        new DiscordStrategy(
            {
                clientID: config.discord.client_id,
                clientSecret: config.discord.client_secret,
                callbackURL: `http://localhost:${config.port}/auth/discord/callback`,  //FIXME for the cloud
                scope: ['identify', 'email'],
            },
            async (accessToken, refreshToken, profile, done) => {
                const existingUser = await users.getUserByDiscordId(profile.id);
                if (existingUser) return done(null, existingUser);
                //try to find user by email
                let user = await users.getUserByEmail(profile.email);
                if (!user) {
                    user = await users.createUser({
                        discordId: profile.id,
                        email: profile.email,
                        name: profile.username,
                        picture: `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`,
                    });
                } else {
                    user = await users.updateUser(user._id, {discordId: profile.id});
                }
                const newUser = await users.getUserById(user._id);
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
            res.send('Přihlášení přes Discord úspěšné!');
        }
    );
}

module.exports = initDiscordAuth;