var express = require('express'),
    router = express.Router(),
    path = require('path')
    bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

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

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'keyboard cat',
                  cookie: { maxAge: 1200000 },
                  resave: true,
                  saveUninitialized: true,
                }));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(
    { usernameField: 'email' },
    function(email, password, done) {
        console.log('email/pwd', email, password);
        var result = db.getUser(email, function(user) {
          console.log("inside passport authen", user);
          if (user == -1) {
            return done(null, false);
          }
          if (password != "1") {
            return done(null, false);
          }
          done(null, user);
        });
    })
);

passport.serializeUser(function(user, done) {
    done(null, user.email);
});

passport.deserializeUser(function(email, done) {
    db.getUser(email, function(user) {
        done(null, user);
    });
});

/*
    Routes used
*/
var index = require('./routes/index.js')(app, db, passport);
var graphRoutes = require('./routes/graph.js')(app, db, passport);
var fusionRoutes = require('./routes/fusion.js')(app, db, passport);
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