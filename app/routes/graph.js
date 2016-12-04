var express = require('express');
var router = express.Router();
var moment = require('moment');

module.exports = function(app, db, auth) {

    // Must be logged in to access these routes
    router.use(auth); 

    router.get('/:id', function(req, res) {
        db.getGraph(req.user.email, req.params.id, function(graph) {
            res.render('graph/index', { title_addon: "Graph", user: req.user, graph, message: req.flash('message') });
        });
    });

    /*
        Not needed anymore, search is built into chosen
    */
    router.get('/search/:begin', function(req, res) {
        // console.log(req.params.begin);
        db.graphsBeginWith(req.params.begin + '%', function(graphs) {
            // console.log(graphs);
            res.json(graphs);
        });
    });

    router.post('/addPoint', function(req, res, next) {
        const date = moment(req.body.date, "MMMM D, YYYY").toISOString();
        db.addPoint(parseInt(req.body.id), parseInt(req.body.value), date, function(data) {
            // console.log("Added points: ", data);
            res.redirect("/graph/" + req.body.id);
        });
    });

    router.post('/new', function(req, res) {
        // console.log(req.body.name);
        db.addGraph(req.user.email, req.body.name, function() {
            res.redirect('/dashboard');
        });
    });

    router.post('/delete', function(req, res) {
        db.deleteGraph(req.body.graph_id, req.user.email, function(err) {
            if (err) {
                req.flash('message', 'Could not delete graph, '
                    + req.body.graph_name 
                    + '. If this error persists, please contact support at support@visualyze.xyz.');
                res.redirect('/dashboard');
            } else {
                req.flash('message', 'Graph - ' + req.body.graph_name + ' has been deleted');
                res.redirect('/dashboard');
            }
        });
    });

    router.post('/deletePoint', function(req, res) {
        // console.log(req.body);
        db.deletePoint(req.body.point_id, req.body.graph_id, function(err) {
            if (err) {
                req.flash('message', 'Could not remove point.');
            } else {
                req.flash('message', 'Removed selected point.');
            }
            res.redirect('/graph/' + req.body.graph_id);
        });
    });

    return router;
}