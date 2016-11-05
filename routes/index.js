var express = require('express'),
    moment = require('moment'),
    router = express.Router();

var db = require('../db.js');

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

router.post('/graph/addPoint', function(req, res, next) {
    const date = moment(req.body.date, "MMMM D, YYYY").toISOString();
    db.addPoint(parseInt(req.body.id), parseInt(req.body.value), date, function(data) {
        console.log("Added points: ", data);
        res.redirect("/graph/" + req.body.id);
    });
});

router.get('/fusion/:id', function(req, res) {
    db.getFusion("jacky", req.params.id, function(fusion) {
        res.render('fusion', { title_addon: "Fusion", fusion });
    });
});

module.exports = router;