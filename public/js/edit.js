define(function(require){
  //activate bootstrap features
  require('bootstrap');

  var previewer = require('js/edit-components/previewer');
  var editor = require('js/edit-components/editor');
  
  previewer.bindEditor(editor);
  
  // require('js/edit-components/shortcuts');
  require('js/helpers/copy-to-clipboard');
  
  require('js/sharing/index');
  require('js/edit-components/title-changer');

  require('js/edit-components/ot-client');


});