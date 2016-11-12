/*
    Set up authentication strategies
*/
var LocalStrategy = require('passport-local').Strategy;

module.exports = function(db, passport) {

    passport.use(new LocalStrategy(
        { usernameField: 'email' },
        function(email, password, done) {
            console.log('email/pwd', email, password);
            var result = db.getUser(email, function(user) {
                console.log("inside passport authen", user);
                if (user == -1) { // User not found
                    return done(null, false, { message: 'User does not exist.' });
                }

                if (password != user.password) { // Incorrect password
                    return done(null, false, { message: 'Incorrect password.' });
                }

                done(null, user);
            });
        })
    );

    passport.serializeUser(function(user, done) {
        done(null, user.email);
    });

    passport.deserializeUser(function(email, done) {
        db.getUser(email, function(user) {
            done(null, user);
        });
    });

    /*
        Returning function that checks if user is logged in
    */
    return function(req, res, next) {
        console.log("auth middleware", req.isAuthenticated());
        if (req.isAuthenticated()) {
            return next();
        }
        return res.redirect('/login');
    };
}