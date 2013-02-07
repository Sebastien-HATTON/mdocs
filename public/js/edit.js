define(function(require){

  "use strict";

  //activate bootstrap features
  require('bootstrap');

  var previewer = require('js/edit-components/previewer');
  var editor    = require('js/edit-components/editor');
  var otClient  = require('js/edit-components/ot-client');
  var shortcuts = require('js/edit-components/shortcuts');
  
  previewer.bindEditor(editor);
  otClient.bindEditor(editor);
  shortcuts.bindEditor(editor);
  
  require('js/helpers/copy-to-clipboard');
  require('js/sharing/index');
  require('js/edit-components/title-changer');


});