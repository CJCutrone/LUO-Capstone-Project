import GoogleStrategy from "passport-google-oauth20";
import database from "./database";

/**
 * @author Camille Cutrone
 */
const config = {
    google: {
        clientID: process.env.CapstoneClientID,
        clientSecret: process.env.CapstoneClientSecret,
        callbackURL: "/login/google/callback",
        accessType: "offline",
    }
};

/**
 * Part of Passport, this (upon a successful login) will attempt to log the user in
 * by checking to see if a login exists with that Google Account
 * @author Camille Cutrone
 */
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

/**
 * Retrieves the original page the user was trying to access before 
 * being redirected to the login page and sends them to that page
 * @param { Request } req 
 * @param { Response } resp 
 * @author Camille Cutrone
 */
const redirect = (req, resp) => {
    const _redirect = req.session.oauth2return || "/";
    delete req.session.oauth2return;
    resp.redirect(_redirect);
};

/**
 * Ensures that the user is authenticated before allowing them to access the API
 * @param { Request } req
 * @param { Response } resp
 * @param { Function } next
 * @author Camille Cutrone
 */
const requireAuthenticationAPI = (req, resp, next) => {
    // if(!req.user) {
    //     req.session.oauth2return = req.originalUrl;
    //     resp.json({ error: { id: -1, message: "Must be signed in" }});
    // }else 
    next();
};

/**
 * Ensures that the user is authenticated before allowing them to view the page
 * @param { Request } req
 * @param { Response } resp
 * @param { Function } next
 * @author Camille Cutrone
 */
const requireAuthentication = (req, resp, next) => {
    // if(!req.user) {
    //     req.session.oauth2return = req.originalUrl;
    //     resp.redirect("/login");
    // }else 
    next();
};

export default {
    googleStrategy,
    redirect,
    requireAuthentication,
    requireAuthenticationAPI
};