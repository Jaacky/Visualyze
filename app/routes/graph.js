var express = require('express');
var router = express.Router();
var moment = require('moment');

module.exports = function(app, db, passport) {

    router.get('/:id', function(req, res) {
        db.getGraph("jacky", req.params.id, function(graph) {
            res.render('graph', { title_addon: "Graph", graph });
        });
    });

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
        db.addGraph('jacky', req.body.name, function() {
            res.redirect('/');
        });
    });

    return router;
}