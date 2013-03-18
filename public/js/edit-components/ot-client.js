define(function(require){
  "use strict";

  var sio = require('socket.io');
  var $                 = require('jquery');
  var ot                = require('ot');
  var EditorClient      = ot.EditorClient;
  var SocketIOAdapter   = ot.SocketIOAdapter;
  var CodeMirrorAdapter = ot.CodeMirrorAdapter;

  var documentDeletedWarning = require('js/templates/document-deleted-warning');


  function onDocDeleted() {
    $(documentDeletedWarning())
      .appendTo('body')
      .modal('show')
      .on('hidden', function () {
        window.location = '/';
      });
  }

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
      })
      .once('document deleted', onDocDeleted)
      .on('cursor', function(cursor){
        setTimeout(function(){
          var clientName = cmClient.getClientObject(cursor.clientId).name;
          $('.tooltip-inner:contains(' + clientName + ')').parent().remove();
          $('.other-client[data-clientid="' + cursor.clientId + '"]').tooltip({
            title: clientName
          }).tooltip('show');
          setTimeout(function(){
            $('.tooltip-inner:contains(' + clientName + ')').parent().remove();
          }, 5000);
        }, 100);
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

    return socket;
  }

  return { bindEditor: bindEditor };
});