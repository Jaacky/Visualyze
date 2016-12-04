var express = require('express');
var router = express.Router();
var moment = require('moment');

module.exports = function(app, db, auth) {

    // Must be logged in to access these routes
    router.use(auth);

    router.get('/:id', function(req, res) {
        db.getFusion(req.user.email, req.params.id, function(results) {
            res.render('fusion/index', 
                {
                    title_addon: "Fusion",
                    user: req.user, 
                    fusion: results.fusion,
                    userGraphs: results.userGraphs,
                    people: results.people,
                    message: req.flash('message'), 
                }
            );
        });
    });

    router.post('/new', function(req, res) {
        db.addFusion(req.user.email, req.body.name, function() {
            res.redirect('/dashboard');
        });
    });

    router.post('/add', function(req, res) {
        // console.log(req.body);
        db.addGraphsToFusion(req.body.fusion_id, req.body.graphs_added, function() {
            res.redirect('/fusion/' + req.body.fusion_id);
        });
    });

    router.post('/invite', function(req, res) {
        app.get('io').emit('notify', "helloworld");
        db.addFusionRequests(req.body.fusion_id, req.user.email, req.body.invitees, function() {
            res.redirect('/fusion/' + req.body.fusion_id);
        });
        // res.redirect('/fusion/' + req.body.fusion_id);
    });

    router.post('/accept', function(req, res) {
        db.acceptFusionRequest(req.body.fusion_id, req.user.email, function() {
            req.flash('message', 'Accepted fusion invite');
            res.redirect('/dashboard');
        })
    });

    router.post('/removeGraph', function(req, res) {
        db.removeGraphFromFusion(req.body.fusion_id, req.body.graph_id, req.user.email, function(err) {
            if (err) {
                req.flash('message', 'Could not remove graph');
                res.redirect('/fusion/' + req.body.fusion_id);
            } else {
                req.flash('message', 'Removed graph ' + req.body.graph_name + '.');
                res.redirect('/fusion/' + req.body.fusion_id);
            }
        });
    });

    router.post('/leave', function(req, res) {
        db.leaveFusion(req.body.fusion_id, req.user.email, function(err) {
            req.flash('message', 'Left ' + req.body.fusion_name);
            res.redirect('/dashboard');
        });
    });

    return router;
}