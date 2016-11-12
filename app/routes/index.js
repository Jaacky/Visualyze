var express = require('express');
var router = express.Router();

module.exports = function(app, db, passport, auth) {
    router.get('/', function(req, res) {
        res.render('index');
    });

    router.get('/login', function(req, res) {
        res.render('login', { message: req.flash('error') });
    });

    router.post('/login',
        passport.authenticate('local', {
            successRedirect: '/dashboard',
            failureRedirect: '/login',
            failureFlash: true
        })
    );

    router.get('/logout', function(req, res) {
        req.session.destroy(function(err) {
            res.redirect('/');
        });
    });

    /* Needs auth to access route */
    router.get('/dashboard', auth, function(req, res, next) {
        console.log("dashboard, req.user", req.user);
        db.getUser(req.user.email, function(user) {
            db.getAllUserPlots(req.user.email, function(plots) {
                res.render('dashboard', { title_addon: "Dashboard", user, plots: plots});
            });
        });
    });

    router.post('/friends/add', function(req, res) {
        db.addFriendRequest(req.body.user_a, req.body.user_b, function() {
            res.redirect('/');
        });
    });

    return router;
}

// module.exports = router;