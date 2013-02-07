define(function(require){
  "use strict";
  var $ = require('jquery');
  
  function showPopup(id, editor){
    $(id).modal().one('hidden', function () {
      editor.focus();
    });
  }

  return {
    bindEditor: function (editor) {
      editor.setOption('extraKeys', {
        "Enter": "newlineAndIndentContinueMarkdownList",
        "Alt-/": showPopup.bind(null, '#key-shortcuts-help', editor),
        "Alt-S": showPopup.bind(null, '#settings-popup', editor),
        "Alt-M": showPopup.bind(null, '#syntax-help', editor),
        "Alt-W": function() {
          window.open('/view/' + window.docId, '_blank');
        },
        // "Alt-M": function() {
        //   $('#syntax-help').modal({
        //     remote: 'http://daringfireball.net/projects/markdown/syntax'
        //   }).one('hidden', function () {
        //     editor.focus();
        //   });
        //   // window.open('http://daringfireball.net/projects/markdown/syntax', '_blank');
        // },
        "Alt-V": function() {
          if($('#editor').hasClass('span6')){
            $('#preview').hide();
            $('#editor').removeClass('span6').addClass('span12');
          } else {
            $('#preview').show();
            $('#editor').addClass('span6').removeClass('span12');
          }
          editor.resize();
        }
      });
    }
  };
});