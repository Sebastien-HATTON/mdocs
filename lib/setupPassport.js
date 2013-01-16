var passport = require('passport'),
  GoogleStrategy = require('passport-google').Strategy,
  users = require('./users'); 

var baseUrl = process.env.BASE_URL || 'http://localhost:8080/';

exports.init = function () {

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    users.findById(id, function(err, user) {
      done(err, user);
    });
  });

  passport.use(new GoogleStrategy({
    returnURL: baseUrl + 'auth/google/return',
    realm: baseUrl
  }, function (identifier, profile, done) {
    profile.id = identifier;
    users.findOrCreate(profile, function(err){
      console.log(err);
      if(err) return done(err);
      console.log(identifier);
      console.log(profile);
      done(null, profile);
    });
  }));

};


exports.routes = function(app){
  app.get('/login', passport.authenticate('google'));

  app.get('/auth/google/return', 
    passport.authenticate('google', { failureRedirect: '/login' }), 
    function (req, res) {
      if(req.session.redirectTo){
        res.redirect(req.session.redirectTo);
        delete req.session.redirectTo;
      }else{
        res.redirect('/');
      }

    });
};