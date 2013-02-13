define(function (require) {
  require('bootstrap');
  var $ = require('jquery');
  var removeDocConfirmationTempl = require('js/templates/remove-document-confirmation');

  $('.remove-doc').on('click', function(e){
    e.preventDefault();
    var row = $(this).parents('tr');
    var docId = $(this).attr('data-id');
    var docName = $(this).attr('data-name');
    
    var popup = $(removeDocConfirmationTempl({name: docName}))
      .appendTo('body')
      .modal('show')
      .on('hidden', function(){
        $(this).remove();
      });
    
    popup.find('.yes-remove')
      .on('click', function(){
        $.ajax({
          url: '/doc/' + docId,
          type: 'DELETE'
        }).always(function(){
          popup.modal('hide');
        }).done(function(){
          row.remove();
        });
      });
  });
});