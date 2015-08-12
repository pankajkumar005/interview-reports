var express = require('express');
var util = require('util');
var router = express.Router();

var config = require('config');

var app = express();
var googleProfile;

//google authenticate modueles
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;


app.use(passport.initialize());
app.use(passport.session());



// API Access link for creating client ID and secret:
// https://code.google.com/apis/console/
var GOOGLE_CLIENT_ID = config.get('google.clinet_ID')
var GOOGLE_CLIENT_SECRET = config.get('google.client_secret');
var reservedIds = config.get('google.reservedIds');


passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});


passport.use(new GoogleStrategy({
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/google/callback"
    },
    function(accessToken, refreshToken, profile, done) {
        process.nextTick(function() {
            var userEmail = profile.emails[0].value;
            googleProfile = profile;
            /*console.log('id : ' + profile.id);
            console.log('name :' + profile.displayName);
            console.log('email :' + profile.emails[0].value);
            */    
            if (reservedIds.indexOf(userEmail) >=0) {
                    // To keep the example simple, the user's Google profile is returned to
                    // represent the logged-in user.  In a typical application, you would want
                    // to associate the Google account with a user record in your database,
                    // and return that user instead.
                    return done(null, profile);
                } else {
                    done(new Error("Access denied. You are not authorized to access this site."));
                }


        });
    }
));


// GET /auth/google
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Google authentication will involve
//   redirecting the user to google.com.  After authorization, Google
//   will redirect the user back to this application at /auth/google/callback
app.get('/google',
    passport.authenticate('google', {
        scope: ['https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email'
        ]
    }),
    function(req, res) {
        res.redirect('/upload')
            // The request will be redirected to Google for authentication, so this
            // function will not be called.
    });

// GET /auth/google/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/'
    }),
    function(req, res) {
        console.log("inside callback");
        req.session.googleProfile  = googleProfile;
        res.redirect('/upload');
    });

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

module.exports = app;
