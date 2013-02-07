define(function(require){
  var $ = require('jquery');
  var Showdown = require('showdown');
  var converter = new Showdown.converter();


  function update (snapshot) {
    var html = converter.makeHtml(snapshot);
    $('#preview').html(html);
  }
  
  var previewer = {
    bindEditor: function (editor) {
      editor.on('change', function () {
        update(editor.getValue());
      });
    }
  };

  return previewer; 
});