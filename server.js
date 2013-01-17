var express = require('express');
var http = require('http');
var share = require('share').server;
var passport = require('passport');

var app = express();
var port = process.env.PORT || 8080;

var setupPassport = require('./lib/setupPassport');
var getDb = require('./lib/getDb');
var MongoStore = require('connect-mongodb');
var passportSharejs = require('passport-sharejs');

var connectionData = require('./lib/getDb/connection-data');

var jadeAmd = require('jade-amd');

var sessionOptions = { 
    key:    'sid',
    cookie: {maxAge: 60000 * 60 * 24}, // 24 hours 
    secret: 'keyboard cat',
    store: new MongoStore({
        db: getDb.createConnector(),
        username: connectionData.user,
        password: connectionData.password,
        collection: 'sessions'
      }, function (err) {
        if (err){
          return console.log('Error connecting MongoStore', err);
        }
        console.log('connected mongostore');
      })
  };

setupPassport.init();

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

setupPassport.routes(app);

app.get('/', function (req, res) {
  var error = (req.session.messages || [])[0];
  delete req.session.messages;

  res.render('index', {
    title:  'Home',
    user:   req.user,
    error:  error
  });
});

app.get("/logout", function(req, res){
  req.logout();
  req.session.destroy();
  res.redirect("/");
});

require('./lib/routes')(app);

share.attach(app, {
  db: {
    type: 'mongo',
    client: getDb.createConnector(),
    user:     connectionData.user,
    password: connectionData.password
  }, 
  auth: passportSharejs(sessionOptions, function (err, agent, action, user) {
    if (err) return action.reject();
    if (action.name !== 'open') return action.accept();

    var docs = require('./lib/docs');
    docs.getForEdit(user, action.docName, function(err, doc){
      return !err && !!doc ? action.accept() : action.reject();
    });

  })
});

http.createServer(app).listen(port, function(){
  console.log('listening in http://localhost:' + port);
});