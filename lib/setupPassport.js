var passport = require('passport');
var users = require('./users'); 

var Auth0Strategy = require('passport-auth0');

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

  passport.use(new Auth0Strategy({
    domain:       process.env.AUTH0_DOMAIN,
    clientID:     process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    callbackURL:  '/callback'
  }, function (accessToken, refreshToken, profile, done) {
    profile.id = profile.user_id;
    
    //------fix this in passport-auth0----
    profile.emails = [{value: profile.email}].concat(

      (profile.emails || []).map(function(m){
        return {
          value: m
        };
      })

    );

    profile.displayName = profile.name;
    //------------------------------------
    
    users.findOrCreate(profile, function(err){
      if(err) return done(err);
      done(null, profile);
    });
  }));

};

exports.routes = function(app){
  app.get('/login', 
    passport.authenticate('auth0', {}), function (req, res) {
    res.redirect("/");
  });

  app.get('/callback', 
    passport.authenticate('auth0', { 
      failureRedirect: '/', 
      failureMessage: true,
      successReturnToOrRedirect: '/'
    }));
};