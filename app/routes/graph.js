var express = require('express');
var router = express.Router();
var moment = require('moment');

module.exports = function(app, db, auth) {

    // Must be logged in to access these routes
    router.use(auth); 

    router.get('/:id', function(req, res) {
        db.getGraph(req.user.email, req.params.id, function(graph) {
            res.render('graph', { title_addon: "Graph", user: req.user, graph });
        });
    });

    /*
        Not needed anymore, search is built into chosen
    */
    router.get('/search/:begin', function(req, res) {
        console.log(req.params.begin);
        db.graphsBeginWith(req.params.begin + '%', function(graphs) {
            console.log(graphs);
            res.json(graphs);
        });
    });

    router.post('/addPoint', function(req, res, next) {
        const date = moment(req.body.date, "MMMM D, YYYY").toISOString();
        db.addPoint(parseInt(req.body.id), parseInt(req.body.value), date, function(data) {
            console.log("Added points: ", data);
            res.redirect("/graph/" + req.body.id);
        });
    });

    router.post('/new', function(req, res) {
        console.log(req.body.name);
        db.addGraph(req.user.email, req.body.name, function() {
            res.redirect('/dashboard');
        });
    });

    return router;
}