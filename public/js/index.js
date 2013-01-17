define(function (require) {
  require('bootstrap');
  $('#sign-in').click(function(e){
    e.preventDefault();
    window.Auth0.signIn();
  });
});