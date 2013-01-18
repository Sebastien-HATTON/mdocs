var Auth0 = require('auth0');

var auth0Client = new Auth0({
  domain:       process.env.AUTH0_DOMAIN,
  clientID:     process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET
});

module.exports = function (app) {
  app.post('/provisioning', function (req, res) {
    console.log(req.body);
    res.send(201);
  });
};

