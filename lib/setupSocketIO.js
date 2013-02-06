var socketIo = require('socket.io');
var passportSocketIO = require('passport.socketio');

module.exports = function (server, sessionOptions) {
  var sio = socketIo.listen(server, { log: false });
  sio.set('authorization', passportSocketIO.authorize(sessionOptions));
  sio.configure('production', function () {
    sio.set('transports', ['xhr-polling']);
    sio.set('polling duration', 10);
  });
  return sio;
};