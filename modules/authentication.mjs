import GoogleStrategy from "passport-google-oauth20";
import database from "./database";

const config = {
    google: {
        clientID: process.env.CapstoneClientID,
        clientSecret: process.env.CapstoneClientSecret,
        callbackURL: "/login/google/callback",
        accessType: "offline",
    }
};

const googleStrategy = new GoogleStrategy(config.google, (_, __, profile, cb) => {
    const _googleID = profile.id;
    const _email = profile.emails[0].value;
    const _name = profile.displayName;
    database
        .query("SELECT userID FROM user_logins WHERE oauthProvider=? AND oauthID=?", ["google", _googleID])
        .then((result) => {
            if(result.length <= 0) {
                cb(null, false);
            }else{   
                const _userID = result[0].userID;
                cb(null, {
                    userID: _userID,
                    email: _email,
                    name: _name
                });
            }
        });
});

const redirect = (req, resp) => {
    const _redirect = req.session.oauth2return || "/";
    delete req.session.oauth2return;
    resp.redirect(_redirect);
};

const requireAuthenticationAPI = (req, resp, next) => {
    if(!req.user) {
        req.session.oauth2return = req.originalUrl;
        resp.json({ error: { id: -1, message: "Must be signed in" }});
    }else next();
};

const requireAuthentication = (req, resp, next) => {
    if(!req.user) {
        req.session.oauth2return = req.originalUrl;
        resp.redirect("/login");
    }else next();
};

export default {
    googleStrategy,
    redirect,
    requireAuthentication,
    requireAuthenticationAPI
};