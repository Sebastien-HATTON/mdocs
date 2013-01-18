define(function (require) {
  require('bootstrap');
  
  $('#sign-in, .sign-in').click(function(e){
    e.preventDefault();
    window.Auth0.signIn();
  });

  $('#create-company').click(function (e) {
    
    e.preventDefault();

    window.Auth0.showProvisioning(function(data, callback) {
       $.post('/provisioning', {
          data: data, 
          success: function(result) { 
            callback({worked: true, provisioning_ticket_url: 'https://markdio.auth0.com/p/google-apps/c6w3zsEC'});  
          }
        });
    });
  });
});