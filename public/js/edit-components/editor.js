define(function(require){
  var $ = require('jquery');
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

  editor.getSession().setValue($('#initial').val());


  var session = editor.session;
  var renderer = editor.renderer;

  session.setUseWrapMode(true);
  session.setWrapLimitRange(null, null);
  renderer.setPrintMarginColumn(80);

  //load share-ace bridge
  require('share-ace');

  editor.bindAceDocument = function (doc) {
    doc.attach_ace(this);
    this.setReadOnly(false);
    this.focus();
  };

  return editor;
});