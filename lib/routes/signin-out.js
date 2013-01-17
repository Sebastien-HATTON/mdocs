var passport = require('passport');
var baseUrl = process.env.BASE_URL || 'http://localhost:8080/';

module.exports = function(app){
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

  app.get("/logout", function(req, res){
    req.logout();
    req.session.destroy();
    res.redirect("/");
  });
};