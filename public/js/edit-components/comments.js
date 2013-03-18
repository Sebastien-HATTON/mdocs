define(function (require) {
  
  var $ = require('jquery');
  $('.comments-button').on('click', function (e) {
    e.preventDefault();
    $('#comments-container').show();
  });

  $('#comments-container .close').on('click', function (e) {
    e.preventDefault();
    $('#comments-container').hide();
  });
  function start () {

  }
});