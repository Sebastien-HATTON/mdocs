define(function(require){
  var CodeMirror = require('CodeMirror');

  var editorWrapper = document.getElementById('editor');
  
  var cm = CodeMirror(editorWrapper, {
    lineNumbers: true,
    lineWrapping: true,
    mode: 'markdown',
    readOnly: 'nocursor',
    theme: 'default'
  });

  return cm;
});