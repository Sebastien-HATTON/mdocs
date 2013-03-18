define(function(require){

  "use strict";

  //activate bootstrap features
  require('bootstrap');

  var previewer = require('js/edit-components/previewer');
  var editor    = require('js/edit-components/editor');
  var otClient  = require('js/edit-components/ot-client');
  var shortcuts = require('js/edit-components/shortcuts');
  
  var socket = otClient.bindEditor(editor);
  previewer.bindEditor(editor);
  shortcuts.bindEditor(editor);
  
  var titleChanger = require('js/edit-components/title-changer');
  titleChanger.bindSocket(socket);
  
  require('js/helpers/copy-to-clipboard');
  require('js/sharing/index');
  require('js/edit-components/comments');

});