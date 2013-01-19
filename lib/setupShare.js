var share = require('share').server;
var getDb = require('./getDb');
var passportSharejs = require('passport-sharejs');
var connectionData = require('./getDb/connection-data');
var docs = require('./docs');

module.exports = function (app, sessionOptions) {

  var auth = passportSharejs(sessionOptions, function (err, agent, action, user) {
    if (err) return action.reject();
    if (action.name !== 'open') return action.accept();

    docs.get(action.docName, function(err, doc){
      if (err || !doc) return action.reject();

      var maxPerm = docs.getMaxPermission(user, doc);
      return maxPerm === 'can edit' ? action.accept() : action.reject();
    });
  });

  share.attach(app, {
    db: {
      type:     'mongo',
      client:   getDb.createConnector(),
      user:     connectionData.user,
      password: connectionData.password
    }, 
    auth: auth
  });
};