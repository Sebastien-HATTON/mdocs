var passport = require('passport');
var baseUrl = process.env.BASE_URL || 'http://localhost:8080/';

var Auth0 = require('auth0');

var auth0Client = new Auth0({
  domain:       process.env.AUTH0_DOMAIN,
  clientID:     process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET
});

/**
 * if the query has granted=true, it will show a page that 
 * we have added a new connection. 
 * 
 * Probabily this means a new customer.
 */
function domainGrantedMiddleware(req, res, next) {
  if(req.query.granted === 'true'){
    return res.render('domain-granted', {
      domain: req.query.domain,
      title: 'mdocs',
      user: null
    });
  }
  next();
}

/**
 * Handle domain mismatch error.
 * This error means for instance someone tried to login with a
 * google-apps connection using his gmail account.
 */
function handleDomainMismatchError(req, res, next){
  if (req.query.error && req.query.error === '') {
    return res.render('index', {
      error: 'You are trying to login with some email but you are already logged with another one.'
    });
  }
  next();
}

/**
 * The inverse to handleDomainMismatchError,
 * if a user logins with @hiscompany.com account but using 
 * the standard google connection and we have a connection for @hiscompany.com  
 * i will logout him and force login with the right connection. 
 * This can be done only for google/google apps and it is just an optimization.
 *
 * In the future auth0 might do this itself.
 */
function logoutLoginWithEnterpriseConnection(req, res, next) {
  if (!req.user || req.user.provider !== 'google-oauth2') return next();

  var googleDomains = ['googlemail.com', 'gmail.com'];
  var emailDomain = req.user.emails[0].value.split('@')[1];

  if (!~googleDomains.indexOf(emailDomain)) {
    

    auth0Client.getConnections(function (err, conns) {
      if(err) return next();
      
      var connectionForThisDomain = conns.filter(function (c) {
        return c.strategy == "google-apps" && c.options.tenant_domain === emailDomain;
      })[0];
      
      if(!connectionForThisDomain) return next();

      req.session.returnToAfterLogout =
        '/login?connection=' + connectionForThisDomain.name +
        (req.session.returnTo ? '&returnTo=' + encodeURIComponent(req.session.returnTo) : '');

      res.redirect('/logout');
    });

  } else {
    next();
  }
}

module.exports = function(app){
  app.get('/login',
    function (req, res, next) {
      if (req.query.returnTo) {
        req.session.returnTo = req.query.returnTo;
      }
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
    domainGrantedMiddleware, 
    handleDomainMismatchError,
    passport.authenticate('auth0', { }), 
    logoutLoginWithEnterpriseConnection,
    function (req, res) {

      // this could be handled by passport.js, if you dont 
      // need logoutLoginWithEnterpriseConnection just use 
      // passport.authenticate('auth0', { 
      //   failureRedirect: '/', 
      //   failureMessage: true,
      //   successReturnToOrRedirect: '/'
      // }) 
    
      if (!req.user) {
        res.redirect('/');
      }else {
        if(req.session.returnTo) {
          res.redirect(req.session.returnTo);
          delete req.session.returnTo;
        } else {
          res.redirect('/');
        }
      }
    });

  app.get("/logout", function(req, res){
    var returnToAfterLogout = req.session.returnToAfterLogout;
    req.logout();
    req.session.destroy();
    res.redirect(returnToAfterLogout || "/");
  });
};