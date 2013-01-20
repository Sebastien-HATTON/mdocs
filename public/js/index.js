define(function (require) {
  require('bootstrap');
  var $ = require('jquery');
  var request = require('reqwest');

  $('#sign-in, .sign-in').click(function(e){
    e.preventDefault();
    window.Auth0.signIn();
  });

  $('#create-company').click(function (e) {
    
    e.preventDefault();
      window.Auth0.showProvisioning(function(data, callback) {

        request({
            url:          '/provisioning',
            method:       'post',
            contentType:  'application/json',
            data:         JSON.stringify(data),
            type:         'json',
            success: function (r) {
              callback(r); 
            }
          });

      });
  });
});