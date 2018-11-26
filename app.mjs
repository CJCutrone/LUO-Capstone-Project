// ONLY ENABLE IN TEST ENV -- home network messes up certain outgoing connections, rather than manipulate the home network settings, enable this.
/* @author Camille Cutrone */

if(process.env.isDevEnvironment){
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; 
}

import passport from 'passport';
import express from 'express';
import session from 'express-session';
import path from 'path';

import authentication from './modules/authentication'
import routes from './routes'
import data from './modules/data'

const __dirname = routes.__dirname;
const port = process.env.PORT || 5000;

passport.use(authentication.googleStrategy);
passport.serializeUser((user, cb)=> cb(null, user));
passport.deserializeUser((obj, cb)=> cb(null, obj));

const server = express()
                .use(express.static(path.join(__dirname, 'public')))
                .use(express.json())
                .use(session({secret: '665db7a1-69ba-49c8-950d-cc6f745a5ff3', resave: true, saveUninitialized: true}))
                .use(passport.initialize())
                .use(passport.session())
                .set('views', path.join(__dirname, 'views'))
                .set('view engine', 'pug')
                .get('/', authentication.requireAuthentication, routes.applicationPage)
                .get('/logout', routes.logoutPage)
                .get('/login', routes.loginPage)
                .get('/login/google/', passport.authenticate('google', { scope: ['email', 'profile']}))
                .get('/login/google/callback', passport.authenticate('google'), authentication.redirect)
                .get('/api/data/months', authentication.requireAuthentication, data.monthsData)
                .get('/api/data/volunteers', authentication.requireAuthentication, data.volunteerData)
                .post('/api/data/edit/project', authentication.requireAuthentication, data.updateProject)
                .post('/api/data/edit/volunteer', authentication.requireAuthentication, data.updateVolunteer)
                .post('/api/data/remove/project', authentication.requireAuthentication, data.removeProject)
                .post('/api/data/remove/volunteer', authentication.requireAuthentication, data.removeVolunteer)
                .listen(port);