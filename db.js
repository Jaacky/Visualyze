var pgp = require("pg-promise")();
var config = require("./config.js")();

var cn = {
    host: config.db.host,
    port: config.db.port,
    database: config.db.name,
};

var db = pgp(cn);

var getUser = function(email, cb) {
    db.one('SELECT * FROM users WHERE email = $1', [email])
        .then(function(data) {
            cb(data);
        })
        .catch(function(err) {
            console.log(err);
        });
}

var getAllUsers = function(cb) {
    db.any("select * from users")
        .then(function(data) {
            cb(data);
        })
        .catch(function(err) {
            console.log(err);
        });
}

module.exports = {
    "getUser": getUser,
    "getAllUsers": getAllUsers
}