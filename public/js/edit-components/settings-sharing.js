define(function (require) {
  var $ = require('jquery');
  var request = require('reqwest');
  var ZeroClipboard = require('zeroclipb');
  
  // var settingsPopup = $('#settings-popup');
  var collabTemplate = require('js/templates/collaborator-row');
  var visibilityTmpl = require('js/templates/visibility-row');

  require('jeditable');
  

  new ZeroClipboard($("#copy-url"), {
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

  $('#doc-url, #doc-url-viewer').click(function(){
    this.select();
  });

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

  $('#add-collab').on('submit', function (e) {
    e.preventDefault();
    var collaborator = {
      email:  $('#new-collab').val(),
      type:   $('#new-collab-type').val()
    };

    changeCollaborator(collaborator, function(){
      var newRow = $(collabTemplate({c: collaborator}));

      $('#collabs-table').append(newRow);
      
      // bindPermissionEditor(newRow);

      $('#new-collab').val('').focus();
    });
  });

  $('#collabs-table').on('click', '.remove-collab', function(e){
    e.preventDefault();

    var row = $(this).parents('tr'),
        email = row.attr('data-email');

    request({
      url:    '/doc/' + window.docId + '/collaborators/' + email,
      method: 'delete',
      type:   'html'
    });

    row.remove();
  });

  $('#visibility-table').on('click', '.change-level', function (e) {
    e.preventDefault();

    var row = $(this).parents('tr');
    var visibilityTitle = $('.edit-visibility-dd', row);

    var type = $(this).attr('data-type');
    var level = row.attr('data-level');

    request({
      url:          '/doc/' + window.docId + '/visibility',
      method:       'post',
      contentType:  'application/json',
      data:         JSON.stringify({
        level: level,
        type:  type
      }),
      type:         'json',
      success: function (r) {
        var model = {
          d: {
            level:   level,
            company: r.company,
            type:    type
          }
        };
        row.replaceWith($(visibilityTmpl(model)));
      }
    });

  });


  $('#new-collab').typeahead({
    source: function (query, process) {
      request({
        url:    '/users',
        method: 'get',
        type:   'json',
        success: function (users) {
          process(users.map(function(u) { return u.email; }));          
        }
      });
    }
  });
});