var express = require('express'),
    router = express.Router();

var db = require('../db.js');

router.get('/', function(req, res, next) {
    db.getUser("jacky", function(user) {
        db.getGraph("jacky", 1, function(data_points) {
            res.render('index', { title_addon: "test", user: user, "data_points": data_points });
        });
    });
});

module.exports = router;