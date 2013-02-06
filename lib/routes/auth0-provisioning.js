var Auth0 = require('auth0');

var auth0Client = new Auth0({
  domain:       process.env.AUTH0_DOMAIN,
  clientID:     process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET
});

module.exports = function (app) {

  function tryCreate (connection, callback) {
    auth0Client.getConnection(connection.name, function (err, cnn) {
      if(err) return callback(err);
      if(cnn) return callback(null, cnn);
      auth0Client.createConnection(connection, callback);
    });
  }

  app.post('/provisioning', function(req, res) {
    var provisioningRequest = req.body;

    tryCreate(provisioningRequest, function (err, connection) {
      if (err) return res.json({ worked: false, error: err.message });
      res.json({ worked: true, provisioning_ticket_url: connection.provisioning_ticket_url });
    });

  });
};

