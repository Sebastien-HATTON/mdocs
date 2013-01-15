define(function(require){
  var $ = require('jquery');
  var sharejs = require('share');

  var updatePreviewer = require('js/previewer');
  var editor = require('js/editor');
  
  //key shortcuts
  require('js/shortcuts');
  require('js/settings-sharing');

  //activate bootstrap features
  require('bootstrap');

  //Load some dependencies in order to requirejs catch up.
  require('share-ace');

  $('h1#name').editable('/doc/' + window.docId + '/title', {
    'cssclass': 'input-title'
  });

  editor.getSession().setValue($('#initial').val());

  sharejs.open(window.docId, 'text', { authentication: '1234' }, function(error, doc) {
    editor.getSession().setValue('');
    doc.attach_ace(editor);
    editor.setReadOnly(false);
    editor.focus();
    
    updatePreviewer(doc.snapshot);
    doc.on('change', function(){
      updatePreviewer(doc.snapshot);
    });
  });

});