define(function(require){
  //activate bootstrap features
  require('bootstrap');

  var sharejs = require('share');

  var previewer = require('js/edit-components/previewer');
  var editor = require('js/edit-components/editor');
  
  require('js/edit-components/shortcuts');
  require('js/helpers/copy-to-clipboard');
  
  require('js/sharing/index');
  require('js/edit-components/title-changer');

  sharejs.open(window.docId, 'text', function(error, doc) {

    editor.bindAceDocument(doc);    

    previewer.bindAceDocument(doc);

  });

});