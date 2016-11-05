var pgp = require("pg-promise")();
var config = require("./config.js")();

var cn = {
    host: config.db.host,
    port: config.db.port,
    database: config.db.name,
};

var db = pgp(cn);

/*
    Returns a user
*/
const getUser = function(email, cb) {
    db.one('SELECT * FROM users WHERE email = $1', [email])
        .then(function(data) {
            cb(data);
        })
        .catch(function(err) {
            console.log(err);
        });
}

/*
    Not used right now
*/
const getAllUsers = function(cb) {
    db.any("select * from users")
        .then(function(data) {
            cb(data);
        })
        .catch(function(err) {
            console.log(err);
        });
}

/*
    Returns all of a user's graphs
*/
const getAllUserPlots = function(email, cb) {

    var graphQString = "SELECT * FROM graphs "
                + "WHERE owner = $1";

    var fusionQString = "SELECT * FROM "
                    + "(SELECT f.id, f.date_created, f.name, fto.owner "
                    + "FROM fusions as f, fusions_to_owners as fto "
                    + "WHERE f.id = fto.fusion_id) as myf "
                + "WHERE myf.owner=$1";

    var findAllUserGraphs = new pgp.ParameterizedQuery(graphQString);
    var findAllUserFusions = new pgp.ParameterizedQuery(fusionQString);

    db.task(function(t) {
        return t.batch([t.any(findAllUserGraphs, [email]), t.any(findAllUserFusions, [email])]);
    })
        .then(function(result) {
            var graphs = result[0];
            var fusions = result[1];
            cb({graphs, fusions});
        })
        .catch(function(err) {
            console.log("getAllPlots ", err);
        });
}

/*
    Query strings for later use
*/
var getGraphsInFusion =  "SELECT * FROM graphs "
+ "WHERE id IN "
    + "(SELECT graph_id "
    + "FROM fusions_to_graphs as ftg INNER JOIN graphs as g "
    + "ON ftg.fusion_id = g.id)";

var fusionOwnerString = "SELECT f.id, f.date_created, f.name, fto.owner FROM fusions as f, fusions_to_owners as fto WHERE f.id = fto.fusion_id";

/*
    Returns a graph along with all its data points
*/
const getGraph = function(email, graph_id, cb) {

    var graphQString = "SELECT * FROM graphs "
                + "WHERE owner = $1 AND id = $2";
    
    var pointsQString = "SELECT graphs.colour, data_points.value, data_points.date "
                + "FROM graphs INNER JOIN data_points ON "
                + "graphs.id = data_points.graph AND graphs.owner = $1 AND graphs.id = $2";

    var findGraph = new pgp.ParameterizedQuery(graphQString);
    var findPoints = new pgp.ParameterizedQuery(pointsQString);
    
    db.task(function(t) {
        return t.batch([t.one(findGraph, [email, graph_id]), t.any(findPoints, [email, graph_id])]);
    })
        .then(function(result) {
            console.log(result);
            var graph = result[0];
            graph.points = result[1];
            cb(graph);
        })
        .catch(function(err) {
            console.log("TASK AND BATCH ", err);
        });
}

/* 
    Inserting a point to a graph
*/
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
    getAllUserPlots,
    addPoint,
}