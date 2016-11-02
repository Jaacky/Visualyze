var pgp = require("pg-promise")();
var config = require("./config.js")();

var cn = {
    host: config.db.host,
    port: config.db.port,
    database: config.db.name,
};

var db = pgp(cn);

const getUser = function(email, cb) {
    db.one('SELECT * FROM users WHERE email = $1', [email])
        .then(function(data) {
            cb(data);
        })
        .catch(function(err) {
            console.log(err);
        });
}

const getAllUsers = function(cb) {
    db.any("select * from users")
        .then(function(data) {
            cb(data);
        })
        .catch(function(err) {
            console.log(err);
        });
}

// var getGraph = function(email, id, cb) {
//     db.one('SELECT * FROM graphs WHERE owner = $1 AND id = $2', [email, id])
//         .then(function(graph) {
//             db.any("SELECT * FROM data_points WHERE graph = $1", [id])
//                 .then(function(data_points) {
//                     cb(graph, data_points);
//                 })
//                 .catch(function(err) {
//                     console.log("DATAPOINTS ERR: ", err);
//                 });
//         })
//         .catch(function(err) {
//             console.log("GRAPH ERR: ", err);
//         });
// }

const getGraph = function(email, graph_id, cb) {
    
    var queryString = "SELECT graphs.colour, data_points.value, data_points.date "
                + "FROM graphs INNER JOIN data_points ON "
                + "graphs.id = data_points.graph AND graphs.owner = $1 AND graphs.id = $2";

    var findGraph = new pgp.ParameterizedQuery(queryString);
    
    db.any(findGraph,[email, graph_id])
        .then(function(data) {
            cb(data);
        })
        .catch(function(err) {
            console.log(err);
        });
}

const addPoint = function(graph_id, value, date, cb) {
    
    var queryString = "INSERT INTO data_points(graph, value, date) "
                + "VALUES($1, $2, $3)";
    var insertPoint = new pgp.ParameterizedQuery(queryString);

    db.none(insertPoint, [graph_id, value, date])
        .then(function(data) {
            cb(data);
        })
        .catch(function(err) {
            console.log(err);
        });
} 

module.exports = {
    "getUser": getUser,
    "getAllUsers": getAllUsers,
    "getGraph": getGraph,
    "addPoint": addPoint,
}