var getDb = require('./getDb');
var MongoStore = require('connect-mongodb');
var connectionData = require('./getDb/connection-data');

module.exports = function () {
  return { 
    key:    'sid',
    cookie: {maxAge: 60000 * 60 * 24}, // 24 hours 
    secret: 'keyboard cat',
    store: new MongoStore({
        db: getDb.createConnector(),
        username: connectionData.user,
        password: connectionData.password,
        collection: 'sessions'
      }, function (err) {
        if (err){
          return console.log('Error connecting MongoStore', err);
        }
        console.log('connected mongostore');
      })
  };
};