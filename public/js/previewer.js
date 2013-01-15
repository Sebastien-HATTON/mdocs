define(function(require){
  var $ = require('jquery');
  var Showdown = require('showdown');
  var converter = new Showdown.converter();



  return function update (snapshot) {
    var html = converter.makeHtml(snapshot);
    $('#preview').html(html);
  };

});