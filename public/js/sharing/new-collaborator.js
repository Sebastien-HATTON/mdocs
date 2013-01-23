define(function (require) {
  var $ = require('jquery');
  var request = require('reqwest');
  var Jvent = require('Jvent');

  var emitter = new Jvent();
  var collabAutocompleteItemTmpl = require('js/templates/collab-autocomplete-item');

  var users;

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

  $('#add-collab').on('submit', function (e) {
    e.preventDefault();
    var collaborator = {
      // email:  $('#new-collab').val(),
      type:   $('#new-collab-type').val()
    };
    var newCollabSelector = $('#new-collab');

    var u = users.filter(function (u) {
      if( !!newCollabSelector.attr('data-user-id') ){
        return u.data.user_id  === newCollabSelector.attr('data-user-id'); 
      } else if (newCollabSelector.attr('data-email')) {
        return  u.data.email    === newCollabSelector.attr('data-email');
      } else {
        return  u.data.email    === newCollabSelector.val() || 
                u.data.name     === newCollabSelector.val() ||
                u.data.nickname === newCollabSelector.val();
      }
    }).map(function (u) {
      return u.data;
    })[0];

    if (u) {
      collaborator.user_id  = u.user_id;
      collaborator.email    = u.email;
      collaborator.nickname = u.nickname;
      collaborator.name     = u.name;
      collaborator.picture  = u.picture;
    } else {
      if( ~$('#new-collab').val().indexOf('@') ){
        collaborator.email = $('#new-collab').val();
      } else {
        $('#new-collab').addClass('error');
        return;
      }
    }

    changeCollaborator(collaborator, function(){
      $('#new-collab')
        .removeClass('error')
        .val('')
        .attr('data-user-id', '')
        .focus();
      emitter.emit('new', collaborator);
    });
  });


  //load users beforehand
  request({
    url:    '/users?t' + new Date().getTime(),
    method: 'get',
    cache:  false,
    type:   'json',
    success: function (usrs) {
      users = usrs.map(function(u) { 
        var name = new String(u.name + ' ' + (u.email || ' ') + u.nickname);
        name.data = u;
        return name; 
      });
    }
  });

  $('#new-collab').typeahead({
    updater: function () {
      var selectedId = $("li.active div", this.$menu).attr('data-user-id');
      var selectedEmail = $("li.active div", this.$menu).attr('data-email');

      $('#new-collab').attr('data-user-id', selectedId);
      $('#new-collab').attr('data-email', selectedEmail);

      var r = users.filter(function (u) {
        return (selectedId && u.data.user_id == selectedId) ||
               (selectedEmail && u.data.email == selectedEmail);
      })[0];
      return r.data.name || r.data.email;
    },
    highlighter: function(item) {
      return collabAutocompleteItemTmpl({i: item});
    },
    source: function () {
      return users;
    },
    items: 4,
    minLength: 2
  });

  return emitter;
});