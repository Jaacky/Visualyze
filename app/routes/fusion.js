var express = require('express');
var router = express.Router();
var moment = require('moment');

module.exports = function(app, db, passport) {

    router.get('/:id', function(req, res) {
        db.getFusion("jacky", req.params.id, function(plots) {
            res.render('fusion', { title_addon: "Fusion", fusion: plots.fusion, userGraphs: plots.userGraphs });
        });
    });

    router.post('/new', function(req, res) {
        db.addFusion('jacky', req.body.name, function() {
            res.redirect('/');
        });
    });

    router.post('/add', function(req, res) {
        console.log(req.body);
        db.addGraphsToFusion(req.body.fusion_id, req.body.graphs_added, function() {
            res.redirect('/fusion/' + req.body.fusion_id);
        });
    });

    router.post('/invite', function(req, res) {
        app.get('io').emit('notify', "helloworld");
        res.redirect('/fusion/' + req.body.fusion_id);
    });

    return router;
}