var passport = require('passport');
var baseUrl = process.env.BASE_URL || 'http://localhost:8080/';

module.exports = function(app){
  app.get('/login',
    function (req, res, next) {
      if(req.query.connection) {
        return passport.authenticate('auth0', {
          connection: req.query.connection 
        })(req, res, next);
      }
      next();
    },
    passport.authenticate('auth0', {}), 
    function (req, res) {
      res.redirect("/");
    });

  app.get('/callback', 
    function (req, res, next){
      if(req.query.granted === 'true'){
        return res.render('domain-granted', {
          domain: req.query.domain,
          title: 'mdocs',
          user: null
        });
      }
      next();
    },
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