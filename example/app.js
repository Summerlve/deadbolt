var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');
var simpleDeadbolt = require('./security/MySimpleDeadbolt.js');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: "deadbolt",
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 },
  resave: false,
  saveUninitialized: true
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.use('/', require('./routes/login.js'));
app.use('/', require('./routes/logout.js'));
app.use('/simple', require('./routes/simple/guest.js'));
app.use('/simple', simpleDeadbolt.restrict(
    simpleDeadbolt.and([
        simpleDeadbolt.dynamic((identifer, roles, permissions) => {
            return identifer === 'lzsb';
        }),
        simpleDeadbolt.role('admin'),
        simpleDeadbolt.permission('anything')
    ])
), require('./routes/simple/root.js'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
