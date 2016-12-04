var express = require('express'),
    router = express.Router(),
    path = require('path')
    bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var flash = require('connect-flash');
var helmet = require('helmet');

var config = require("./config.js")();
var db = require('./db.js');
var app = express();
var io = require('socket.io');
app.set('io', io);

/*
    Setting view engine to EJS
*/
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(flash());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'keyboard cat',
                  cookie: { maxAge: 1200000 },
                  resave: true,
                  saveUninitialized: true,
                }));
app.use(helmet());
app.use(passport.initialize());
app.use(passport.session());
var auth = require('./auth.js')(db, passport);

/*
    Routes used
*/
var index = require('./routes/index.js')(app, db, passport, auth);
var graphRoutes = require('./routes/graph.js')(app, db, auth);
var fusionRoutes = require('./routes/fusion.js')(app, db, auth);

app.use('/', index);
app.use('/graph', graphRoutes);
app.use('/fusion', fusionRoutes);

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