var Auth0 = require('auth0');

var auth0Client = new Auth0({
  domain:       process.env.AUTH0_DOMAIN,
  clientID:     process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET
});


module.exports = function (app) {

  app.get('/users', 
    app.requireAuthentication, 
    function (req, res) {
      if(req.user.identities[0].isSocial) {
      
        auth0Client.getSocialUsers(function (err, users) {
          if (err) return res.send(500, err);
          res.json(users);
        });
      
      } else {
        auth0Client.getUsers({connection: req.user.identities[0].connection} , function (err, users){
          if (err) return res.send(500, err);
          res.json(users);
        });
      }

    });
};