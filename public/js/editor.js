define(function(require){
  var ace = require('ace/ace');
  require("ace/theme/textmate");
  require("ace/mode/markdown");
  var editor = ace.edit("editor");
  editor.setReadOnly(true);

  editor.getSession().setMode("ace/mode/markdown");
  
  editor.renderer.setShowGutter(false);
  editor.setHighlightActiveLine(false);
  editor.renderer.setShowPrintMargin(false);
  editor.setFontSize('24px');


  var session = editor.session;
  var renderer = editor.renderer;

  session.setUseWrapMode(true);
  session.setWrapLimitRange(null, null);
  renderer.setPrintMarginColumn(80);

  return editor;
});