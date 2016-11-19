var express = require('express');
var router = express.Router();

module.exports = function(app, db, passport, auth) {
    router.get('/', function(req, res) {
        res.render('index', { landing: true });
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
        res.render('dashboard', 
            { 
                title_addon: "Dashboard", 
                user: req.user, 
                message: req.flash('message')
            }
        );
    });

    router.post('/friends/request', function(req, res) {
        db.addFriendRequest(req.body.requester, req.body.requested, function() {
            req.flash('message', 'Sent friend request to ' + req.body.requested);
            res.redirect('/dashboard');
        });
    });

    router.post('/friends/add', function(req, res) {
        res.json("hello");
    });

    router.post('/friends/accept', function(req, res) {
        console.log("post friends/accept user.email", req.user.email);
        db.acceptFriendRequest(req.user.email, req.body.requester, function() {
            req.flash('message', 'Accepted ' + req.body.requester + "'s friend request.");
            res.redirect('/dashboard');
        });
    });

    return router;
}

// module.exports = router;