var express = require('express'),
    moment = require('moment'),
    io = require('socket.io');
    router = express.Router();

var db = require('../db.js');

// module.exports = function(router,)
router.get('/', function(req, res, next) {
    db.getUser("jacky", function(user) {
        db.getAllUserPlots('jacky', function(plots) {
            res.render('index', { title_addon: "Dashboard", user, plots: plots});
        });
    });
});

router.get('/graph/:id', function(req, res) {
    db.getGraph("jacky", req.params.id, function(graph) {
        res.render('graph', { title_addon: "Graph", graph });
    });
});

router.get('/graph/search/:begin', function(req, res) {
    console.log(req.params.begin);
    db.graphsBeginWith(req.params.begin + '%', function(graphs) {
        console.log(graphs);
        res.json(graphs);
    });
});

router.post('/graph/addPoint', function(req, res, next) {
    const date = moment(req.body.date, "MMMM D, YYYY").toISOString();
    db.addPoint(parseInt(req.body.id), parseInt(req.body.value), date, function(data) {
        console.log("Added points: ", data);
        res.redirect("/graph/" + req.body.id);
    });
});

router.post('/graph/new', function(req, res) {
    console.log(req.body.name);
    db.addGraph('jacky', req.body.name, function() {
        res.redirect('/');
    });
});

router.get('/fusion/:id', function(req, res) {
    db.getFusion("jacky", req.params.id, function(plots) {
        res.render('fusion', { title_addon: "Fusion", fusion: plots.fusion, userGraphs: plots.userGraphs });
    });
});

router.post('/fusion/new', function(req, res) {
    db.addFusion('jacky', req.body.name, function() {
        res.redirect('/');
    });
});

router.post('/fusion/add', function(req, res) {
    console.log(req.body);
    db.addGraphsToFusion(req.body.fusion_id, req.body.graphs_added, function() {
        res.redirect('/fusion/' + req.body.fusion_id);
    });
});

module.exports = router;