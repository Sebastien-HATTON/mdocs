var ot = require('ot');
var MongoDBStore = require('./ot/MongoDBStore');

var docs = require('./docs');

var getDb = require('./getDb');
var connectionData = require('./getDb/connection-data');

var cmServers = [];

function getOrCreate (docId, callback) {
  if(cmServers[docId]) return callback(cmServers[docId]);
  var store = new MongoDBStore({
    db: getDb.createConnector(),
    username: connectionData.user,
    password: connectionData.password,
    collection: 'documents'
  }, docId, function () {

    console.log('connected ot.js mongostore');

    cmServers[docId] = new ot.CodeMirrorServerRoom(docId, store);

    cmServers[docId].onEmptyRoom = function () {
      console.log('last socket disconnected from document ' , docId);
      delete cmServers[docId];
    };

    callback(cmServers[docId]);
  });
}

module.exports = function (sio) {
  sio.sockets.on('connection', function (socket) {
    var user = socket.handshake.user;
    if (user) {
      console.log('user', user.displayName, 'connected');
    } else {
      console.log('user anonymous connected');
    }

    socket.on('opendoc', function (obj){
      docs.get(obj.docId, function (err, doc) {
        if(err || !doc) return;
        
        if (!doc.visibility || doc.visibility.public !== 'can edit'){
          var maxPerm = docs.getMaxPermission(user, doc);
          if(maxPerm !== 'can edit') return;
        }


        getOrCreate(obj.docId, function (server) {
          server.hook(socket, user ? user.displayName : 'anonymous' + Math.floor(Math.random()*10000), function (){
            socket.emit('opened', {});
          });
        });

      });
    });
  }).on('reconnect', function (){
    console.log('user', user.displayName, 'reconnected');
  });
};