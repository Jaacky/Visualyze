var express = require('express');
var router = express.Router();

module.exports = function(app, db, passport, auth) {
    router.get('/', function(req, res) {
        res.render('index', { landing: true });
    });

    router.get('/login', function(req, res) {
        res.render('login', { message: req.flash('message'), error: req.flash('error') });
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

    router.get('/signup', function(req, res) {
        res.render('signup', { message: req.flash('error') });
    });

    router.post('/signup', function(req, res) {
        console.log(req.body);
        db.addUser(req.body.email, req.body.password, req.body.first_name, req.body.last_name, function(err) {
            if (err) {
                req.flash('message', 'Account creation failed');
                res.redirect('/login');
                return;
            }
            req.flash('message', 'Account created.');
            res.redirect('/login');
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

    router.get('/requests', auth, function(req, res, next) {
        res.render('requests', {
            title_addon: "Requests",
            user: req.user,
        });
    });

    router.get('/friends', auth, function(req, res) {
        res.render('friends',
            {
                title_addon: "Friends",
                user: req.user,
            }
        );
    });

    router.post('/friends/request', auth, function(req, res) {
        db.addFriendRequest(req.body.requester, req.body.requested, function() {
            req.flash('message', 'Sent friend request to ' + req.body.requested);
            res.redirect('/dashboard');
        });
    });

    router.post('/friends/add', function(req, res) {
        res.json("hello");
    });

    router.post('/friends/accept', auth, function(req, res) {
        console.log("post friends/accept user.email", req.user.email);
        db.acceptFriendRequest(req.user.email, req.body.requester, function() {
            req.flash('message', 'Accepted ' + req.body.requester + "'s friend request.");
            res.redirect('/dashboard');
        });
    });

    return router;
}