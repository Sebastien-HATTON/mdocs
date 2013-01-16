define(function(require){
  var $ = require('jquery');
  var Showdown = require('showdown');
  var converter = new Showdown.converter();


  function update (snapshot) {
    var html = converter.makeHtml(snapshot);
    $('#preview').html(html);
  }
  
  var previewer = {
    bindAceDocument: function (doc) {
      update(doc.snapshot);
      doc.on('change', function () {
        update(doc.snapshot);
      });
    }
  };

  return previewer; 
});