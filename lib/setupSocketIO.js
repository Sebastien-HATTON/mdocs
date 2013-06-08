var socketIo          = require('socket.io');
var passportSocketIO  = require('passport.socketio');
var xtend             = require('xtend');
var docs              = require('./docs');

module.exports = function (server, sessionOptions) {
  var sio = socketIo.listen(server, { log: false });
  var authOptions = xtend({
    fail: function (data, accepts) {
      var docId = data.headers['referer'].split('/').slice(-1)[0];
      docs.get(docId, function (err, doc){
        if (err || !doc) return accepts(null, false);
        if (doc.visibility && doc.visibility.public === 'can edit') {
          return accepts(null, true);
        }
        return accepts(null, false);
      });
    }
  }, sessionOptions);
  sio.set('authorization', passportSocketIO.authorize(authOptions));
  sio.configure('production', function () {
    sio.set('transports', ['xhr-polling']);
    sio.set('polling duration', 10);
  });
  return sio;
};