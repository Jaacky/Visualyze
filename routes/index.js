var express = require('express'),
    moment = require('moment'),
    router = express.Router();

var db = require('../db.js');

router.get('/', function(req, res, next) {
    db.getUser("jacky", function(user) {
        db.getGraph("jacky", 1, function(data_points) {
            res.render('index', { title_addon: "test", user: user, "data_points": data_points });
        });
    });
});

router.post('/graph/addPoint', function(req, res, next) {
    const date = moment(req.body.date, "MMMM D, YYYY").toISOString();
    db.addPoint(1, parseInt(req.body.value), date, function(data) {
        console.log("Added points: ", data);
        res.redirect("/");
    });
});

module.exports = router;