define(function (require) {
  var $ = require('jquery');
  var ZeroClipboard = require('zeroclipb');

  new ZeroClipboard($(".copy-btn"), {
    moviePath: "/components/ZeroClipboard/ZeroClipboard.swf"
  }).on('complete', function() {
    var btn = $(this);
    btn.tooltip({
      title:     'copied!',
      placement: 'bottom',
      trigger:   'manual'
    }).tooltip('show');
    setTimeout(function(){
      btn.tooltip('hide');
    }, 1000);
  });
});