/*
    Set up authentication strategies
*/
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt');

module.exports = function(db, passport) {

    passport.use(new LocalStrategy(
        { usernameField: 'email' },
        function(email, password, done) {
            // console.log('email/pwd', email, password);
            var result = db.getUser(email, function(user) {
                // console.log("inside passport authen", user);
                if (user == -1) { // User not found
                    return done(null, false, { message: 'User does not exist.' });
                }
                bcrypt.compare(password, user.password, function(err, res) {
                    if (err) {
                        console.log("bcrypt err in hash comparision");
                        return -1;
                    }
                    if (res === true) {
                        user.password = 0;
                        return done(null, user);
                    } else {
                        return done(null, false, { message: 'Incorrect password.' });
                    }
                });
            });
        })
    );

    passport.serializeUser(function(user, done) {
        done(null, user.email);
    });

    passport.deserializeUser(function(email, done) {
        db.getUser(email, function(user) {
            user.password = 0;
            done(null, user);
        });
    });

    /*
        Returning function that checks if user is logged in
    */
    return function(req, res, next) {
        // console.log("auth middleware", req.isAuthenticated());
        if (req.isAuthenticated()) {
            return next();
        }
        return res.redirect('/login');
    };
}