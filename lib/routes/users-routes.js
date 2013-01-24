var Auth0 = require('auth0');

var auth0Client = new Auth0({
  domain:       process.env.AUTH0_DOMAIN,
  clientID:     process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET
});

var request = require('request');
var gravatar = require('gravatar');

module.exports = function (app) {

  function getUsersFromCompanyDirectory (req, res, next) {
    if(req.user.identities[0].isSocial) return next();
    auth0Client.getUsers({connection: req.user.identities[0].connection} , function (err, users){
      if (err) return res.send(500, err);
      res.json(users);
    });
  }

  function getContactsFromGoogleApi (req, res, next) {
    if(req.user.identities[0].provider !== 'google-oauth2') return next();
    request.get({
        url: 'https://www.google.com/m8/feeds/contacts/default/full',
        qs: { 
          alt:           'json', 
          'max-results':  1000,
          'orderby':     'lastmodified'
        },
        headers: { 
          'Authorization': 'OAuth ' + req.user.identities[0].access_token,
          'GData-Version': '3.0'
        }
      }, function (err, resp, body) {
        var feed = JSON.parse(body);

        var users = feed.feed.entry.map(function (c) {
          var r =  {};
          if(c['gd$name'] && ['gd$fullName']){
            r.name = c['gd$name']['gd$fullName']['$t'];
          }
          if (c['gd$email'] && c['gd$email'].length > 0) {
            r.email    = c['gd$email'][0]['address'];
            r.nickname = r.email;//c['gd$email'][0]['address'].split('@')[0];
          }
          if(c['link']){
            var photoLink = c['link'].filter(function (link) {
              return link.rel == 'http://schemas.google.com/contacts/2008/rel#photo' && 
                     'gd$etag' in link; 
            })[0];
            if(photoLink) {
              r.picture = '/users/photo?l=' + encodeURIComponent(photoLink.href);
            } else if (r.email) {
              r.picture = gravatar.url(r.email, {
                s: 40, 
                d: "https://i2.wp.com/ssl.gstatic.com/s2/profiles/images/silhouette80.png"});
            }
          }
          return r;
        }).filter(function (u) {
          return !!u.email &&                  //we can only give access to persons with email at this point
                 !~u.email.indexOf('@reply.');  //adress with @reply. are usually temporary reply address for forum kind of websites.
        });

        res.json(users);
      });
  }

  function getSocialUsersLoggedToMdocs (req, res) {
    auth0Client.getSocialUsers(function (err, users) {
      if (err) return res.send(500, err);
      res.json(users);
    });
  }

  app.get('/users', 
    app.requireAuthentication, 
    getUsersFromCompanyDirectory,
    getContactsFromGoogleApi,
    getSocialUsersLoggedToMdocs);


  app.get('/users/photo' , function (req, res) {
    if(!req.query.l) return res.send(400);
    request.get({
        url: req.query.l,
        headers: { 
          'Authorization': 'OAuth ' + req.user.identities[0].access_token
        }
      }).pipe(res);
  });
};