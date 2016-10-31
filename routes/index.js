var express = require('express'),
    router = express.Router();

var db = require('../db.js');

router.get('/', function(req, res, next) {
    db.getUser("jacky", function(user) {
        res.render('index', { title_addon: "test", user: user });
    });
});

module.exports = router;