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

const getAllUserGraphs = function(email, cb) {

    var queryString = "SELECT * FROM graphs "
                + "WHERE owner = $1";

    var findAllUserGraphs = new pgp.ParameterizedQuery(queryString);

    db.any(findAllUserGraphs, [email])
        .then(function(graphs) {
            cb(graphs);
        })
        .catch(function(err) {
            console.log(err);
        });
}

const getGraph = function(email, graph_id, cb) {

    var graphQString = "SELECT * FROM graphs "
                + "WHERE owner = $1 AND id = $2";
    
    var pointsQString = "SELECT graphs.colour, data_points.value, data_points.date "
                + "FROM graphs INNER JOIN data_points ON "
                + "graphs.id = data_points.graph AND graphs.owner = $1 AND graphs.id = $2";

    var findGraph = new pgp.ParameterizedQuery(graphQString);
    var findPoints = new pgp.ParameterizedQuery(pointsQString);
    
    db.one(findGraph, [email, graph_id])
        .then(function(graph) {
            db.any(findPoints,[email, graph_id])
                .then(function(points) {
                    graph.points = points;
                    cb(graph);
                })
                .catch(function(err) {
                    console.log("FIND POINTS: ", err);
                });
        })
        .catch(function(err) {
            console.log("FIND GRAPH ", err);
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
    getUser,
    getAllUsers,
    getGraph,
    addPoint,
    getAllUserGraphs,
}