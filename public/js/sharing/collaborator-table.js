define(function (require) {
  var $       = require('jquery');
  var md5     = require('md5');
  var request = require('reqwest');
  var collabTemplate = require('js/templates/collaborator-row');

  require('scrollto');
  require('jeditable');
  
  function changeCollaborator (collaborator, done) {
    request({
      url:          '/doc/' + window.docId + '/collaborators',
      method:       'post',
      contentType:  'application/json',
      data:         JSON.stringify(collaborator),
      type:         'html',
      success: done
    });
  }

  function loadCollaborators () {
   request({
      url:      '/doc/' + window.docId + '/collaborators?t=' + new Date().getTime(),
      method:   'get',
      type:     'json',
      success:  function (cs) {
        var tbl = $('#collabs-table').html('');
        cs.forEach(function (c) {
          if (!c.picture) {
            var hash = md5(c.email);
            c.picture = 'https://www.gravatar.com/avatar/' + hash + '?s=40&d=' +  
              "https://i2.wp.com/ssl.gstatic.com/s2/profiles/images/silhouette80.png";
          }
          $(collabTemplate({c: c}))
            .appendTo(tbl);
        });
      }
    }); 
  }

  $('#settings-popup').on('show', function(){
    loadCollaborators();
  });

  $('#collabs-table').on('click', '.can-view-option, .can-edit-option', function (e) {
    e.preventDefault();
    var type = $(this).hasClass('can-view-option') ? 'can view' : 'can edit';
    var row = $(this).parents('tr');
    var email = row.attr('data-email');
    var payload = {
      email: email,
      type: type
    };
    var ddtitle = $('.edit-permissions-dd', row);
    changeCollaborator(payload, function () {
      ddtitle.html(type);
    });
  });


  $('#collabs-table').on('click', '.remove-collab', function(e){
    e.preventDefault();

    var row   = $(this).parents('tr'),
        email = row.attr('data-email');

    request({
      url:    '/doc/' + window.docId + '/collaborators/' + email,
      method: 'delete',
      type:   'html'
    });

    row.remove();
  });

  // scroll to make the popup visible
  $('#collabs-table').on('click', '.edit-permissions-dd', 'click', function(e){
    e.preventDefault();
    setTimeout(function(){
      var parent = $(this).parents('.dropdown');
      if(!parent.hasClass('open')) return;
      $('.dropdown-menu li:nth-child(2)', parent).ScrollTo({ 
        onlyIfOutside: true,
        duration: 0 
      });
    }.bind(this), 20);
  });

  return {
    appendNew: function () {
      loadCollaborators();
    }
  };

});