define(function(require){
  var editor = require('js/edit-components/editor');
  var sio = require('socket.io');
  var socket = sio.connect('/');

  var ot                = require('ot');
  var EditorClient      = ot.EditorClient;
  var SocketIOAdapter   = ot.SocketIOAdapter;
  var CodeMirrorAdapter = ot.CodeMirrorAdapter;

  var cmClient;

  socket.on('connect', function () {
    socket.once('opened', function () {
        editor.setOption('readOnly', false);
      }).once('doc', function (doc) {
        editor.setValue(doc.str);
        cmClient = new EditorClient(
          doc.revision,
          doc.clients,
          new SocketIOAdapter(socket),
          new CodeMirrorAdapter(editor)
        );
      }).emit('opendoc', {docId: window.docId});
  });
});