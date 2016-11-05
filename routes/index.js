var express = require('express'),
    moment = require('moment'),
    router = express.Router();

var db = require('../db.js');

router.get('/', function(req, res, next) {
    // db.getUser("jacky", function(user) {
    //     db.getGraph("jacky", 1, function(data_points) {
    //         res.render('index', { title_addon: "test", user: user, "data_points": data_points });
    //     });
    // });
    db.getUser("jacky", function(user) {
        db.getAllUserGraphs('jacky', function(graphs) {
            res.render('index', { title_addon: "Dashboard", user, graphs });
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

module.exports = router;