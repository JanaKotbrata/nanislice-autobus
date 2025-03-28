const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const DiscordStrategy = require('passport-discord').Strategy;
const connectToDb = require('./models/connection-db');
const users = require('./models/users-repository');
const config = require("../config/config.json");


// Nastavení Passport.js
// TODO clean - services  google
passport.use(
    new GoogleStrategy(
        {
            clientID: config.google.client_id,
            clientSecret: config.google.client_secret,
            callbackURL: `http://localhost:${config.port}/auth/google/callback`, //FIXME for the cloud
        },
        async (accessToken, refreshToken, profile, done) => {
            const existingUser = await users.getUsersByGoogleId({googleId: profile.id});
            if (existingUser) return done(null, existingUser);

            const userId = await users.createUser({
                googleId: profile.id,
                email: profile.emails[0].value,
                name: profile.displayName,
                picture: profile.photos[0].value,
            });
            const newUser = await users.getUserById(userId);
            done(null, newUser);
        }
    )
);
//TODO clean - services  google
//TODO clean - services  discord
passport.use(
    new DiscordStrategy(
        {
            clientID: config.discord.client_id,
            clientSecret:config.discord.client_secret,
            callbackURL: `http://localhost:${config.port}/auth/discord/callback`,  //FIXME for the cloud
            scope: ['identify', 'email'],
        },
        async (accessToken, refreshToken, profile, done) => {
            const existingUser = await users.getUsersByDiscordId(profile.id);
            if (existingUser) return done(null, existingUser);

            const userId = await users.createUser({
                discordId: profile.id,
                email: profile.email,
                name: profile.username,
                picture: `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`,
            });
            const newUser = await users.getUserById(userId);
            done(null, newUser);
        }
    )
);
//TODO clean - services  discord
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    const user = await users.getUserById(id);
    done(null, user);
});

// Inicializace Express.js
const app = express();

app.use(
    session({
        secret: config.secret,
        resave: false,
        saveUninitialized: true,
    })
);
app.use(passport.initialize());
app.use(passport.session());

// Routes //TODO clean - services  google
app.get('/', (req, res) => res.send('Hlavní stránka'));

app.get('/auth/google', passport.authenticate('google', {scope: ['profile', 'email']}));

app.get(
    '/auth/google/callback',
    passport.authenticate('google', {failureRedirect: '/'}),
    (req, res) => {
        res.send('Přihlášení přes Google úspěšné!');
    }
);
//TODO clean - services  google
//TODO clean - services  discord
app.get('/auth/discord', passport.authenticate('discord'));

app.get(
    '/auth/discord/callback',
    passport.authenticate('discord', {failureRedirect: '/'}),
    (req, res) => {
        res.send('Přihlášení přes Discord úspěšné!');
    }
);
//TODO clean - services  discord
connectToDb()
    .then(async () => {
        //for creating indexes in db
        await users.createIndexes();
        //for server startup
        app.listen(config.port, () => console.log(`Server run: ${config.port}`))
    })
    .catch((err) => console.error(err));
