var express = require('express'),
    router = express.Router(),
    path = require('path')
    bodyParser = require('body-parser');

var config = require("./config.js")();
var db = require('./db.js');
var app = express();
var io = require('socket.io');
app.set('io', io);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/*
    Setting view engine to EJS
*/
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

/*
    Routes used
*/
var routes = require('./routes/index.js')(router, app, db);
app.use('/', router);

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