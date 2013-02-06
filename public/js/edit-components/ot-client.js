define(function(require){
  "use strict";

  var sio = require('socket.io');

  var ot                = require('ot');
  var EditorClient      = ot.EditorClient;
  var SocketIOAdapter   = ot.SocketIOAdapter;
  var CodeMirrorAdapter = ot.CodeMirrorAdapter;


  function bindEditor(editor) {
    var cmClient;
    var socket = sio.connect('/');
    
    socket
      .once('opened', function () {
        editor.setOption('readOnly', false);
      }).once('doc', function (doc) {
        editor.setValue(doc.str);
        cmClient = new EditorClient(
          doc.revision,
          doc.clients,
          new SocketIOAdapter(socket),
          new CodeMirrorAdapter(editor)
        );
      });

    function openDoc(){
      socket.emit('opendoc', {docId: window.docId});
    }
      
    socket
      .once('connect', openDoc )
      .on('reconnect', openDoc )
      .on('opened', function () {
        if (cmClient.state.resend) cmClient.state.resend(cmClient);
      });
  }

  return { bindEditor: bindEditor };
});