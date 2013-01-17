var express = require('express');
var http = require('http');
var passport = require('passport');

var app = express();
var port = process.env.PORT || 8080;

var jadeAmd = require('jade-amd');

var sessionOptions = require('./lib/setupSession')();

require('./lib/setupPassport')();

app.configure(function(){
  this.set('view engine', 'jade');
  this.set('views', 'views');
  this.use(express.logger('dev'));
  
  this.use(express.static(__dirname  + "/public"));
  this.use('/edit', express.static(__dirname  + "/public/components/ace/lib"));
  this.use('/img',  express.static(__dirname  + "/public/components/bootstrap/img"));
  this.use('/js/templates/', jadeAmd.jadeAmdMiddleware({
    views:       'views/includes',
    jadeRuntime: 'jaderuntime'
  }));

  this.use(express.cookieParser());
  this.use(express.bodyParser());
  this.use(express.session(sessionOptions));
  this.use(passport.initialize());
  this.use(passport.session());
  this.use(app.router);

  this.locals.AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID;
  this.locals.AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
  this.locals.BASE_URL = process.env.BASE_URL || 'http://localhost:8080/';
});

app.get('/', function (req, res) {
  var error = (req.session.messages || [])[0];
  delete req.session.messages;

  res.render('index', {
    title:  'Home',
    user:   req.user,
    error:  error
  });
});

require('./lib/routes')(app);
require('./lib/setupShare')(app, sessionOptions);

http.createServer(app).listen(port, function(){
  console.log('listening in http://localhost:' + port);
});