define(function(require){
  //activate bootstrap features
  require('bootstrap');

  var sharejs = require('share');

  var previewer = require('js/edit-components/previewer');
  var editor = require('js/edit-components/editor');
  
  //key shortcuts
  require('js/edit-components/shortcuts');
  require('js/edit-components/settings-sharing');
  require('js/edit-components/title-changer');

  sharejs.open(window.docId, 'text', function(error, doc) {

    editor.bindAceDocument(doc);    

    previewer.bindAceDocument(doc);

  });

});