var express = require('express'),
    path = require('path'),
    pgp = require("pg-promise")();

var config = require("./config.js")();
var app = express();

/*
    Setting view engine to EJS
*/
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

/*
    Routes used
*/
var routes = require('./routes/');
app.use('/', routes);

var cn = {
    host: config.db.host,
    port: config.db.port,
    database: config.db.name,
};

var db = pgp(cn);

db.any("select * from users")
    .then(function(data) {
        console.log(data);
    })
    .catch(function(err) {
        console.log(err);
    });
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;