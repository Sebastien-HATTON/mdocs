define(function (require) {
  require('bootstrap');
  var $ = require('jquery');

  $('#sign-in, .sign-in').click(function(e){
    e.preventDefault();
    window.Auth0.signIn({onestep: true});
  });

  $('#create-company').click(function (e) {
    e.preventDefault();
    window.Auth0.showProvisioning('/provisioning');
  });
});