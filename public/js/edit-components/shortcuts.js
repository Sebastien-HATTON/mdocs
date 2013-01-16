define(function(require){
  var $ = require('jquery');
  require('jkey');
  var modifier = 'alt';

  if (navigator.appVersion.indexOf("Mac")!=-1){
    modifier = 'option';
  }

  $(document).jkey(modifier + '+h', function() {
    $('#key-shortcuts-help').modal({
      keyboard: true,
      show: true
    });
  });

  $(document).jkey(modifier + '+s', function(){
    $('#settings-popup').modal();
  });

  $(document).jkey(modifier + '+e', function(){
    $('#editor').toggle();
    $('#preview').toggle();
  });

  $(document).jkey('esc', function(){
    $('.modal').modal('hide');
  });

});