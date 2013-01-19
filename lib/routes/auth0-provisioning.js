var Auth0 = require('auth0');

var auth0Client = new Auth0({
  domain:       process.env.AUTH0_DOMAIN,
  clientID:     process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET
});

module.exports = function (app) {
  app.post('/provisioning', function(req, res) {

    var provisioningRequest = req.body;
    //todo remove this:
    provisioningRequest.tenant_domain = provisioningRequest.tenant_domain || provisioningRequest.domain;
    delete provisioningRequest.domain;
    //
    
    provisioningRequest.name = provisioningRequest.tenant_domain
                                                .replace(/\./ig, '-')
                                                .replace(/(-com)$/, '');
    provisioningRequest.options =  {};

    // augment provisioning request
    switch (provisioningRequest.strategy) {
      case 'office365':
        provisioningRequest.options.client_id = process.env.office365_clientId;
        provisioningRequest.options.client_secret = process.env.office365_clientSecret;
        provisioningRequest.options.ext_profile = true;
        provisioningRequest.options.api_enable_users = true;
        break;
      case 'adfs':
        break;
      case 'Google Apps':
        //remove this once the widget returns google-apps
        provisioningRequest.strategy = 'google-apps';
        provisioningRequest.options.client_id = process.env.GOOGLE_APPS_CLIENTID;
        provisioningRequest.options.client_secret = process.env.GOOGLE_APPS_CLIENTSECRET;
        provisioningRequest.options.ext_profile = true;
        provisioningRequest.options.api_enable_users = true; 
        break;
    }

    auth0Client.createConnection(provisioningRequest, function (err, connection) {
      if (err) res.json({ worked: false });
      res.json({ worked: true, provisioning_ticket_url: connection.provisioning_ticket_url });
    });

  });
};

