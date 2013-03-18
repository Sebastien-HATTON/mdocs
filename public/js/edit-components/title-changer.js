define(function (require) {

  var $ = require('jquery');

  require('jeditable');

      

  $('#name').editable('/doc/' + window.docId + '/title', {
    'cssclass': 'input-title',
    'onblur' : 'submit'
  });

  function bindSocket (socket) {
    socket.on('new title', function (change){
      $('#name').html(change.title);
    });
  }

  return { bindSocket: bindSocket };
});