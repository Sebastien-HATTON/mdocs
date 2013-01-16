define(function (require) {
  var $ = require('jquery');
  var request = require('reqwest');
  var settingsPopup = $('#settings-popup');
  var collabTemplate = require('js/templates/collaborator-row');

  require('jeditable');
  
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

  $('.permissions-dd').editable(function (value) { 
    var email = $(this).parents('tr').attr('data-email');
    
    changeCollaborator({ 
      email: email, 
      type: value
    }, function() {});

    return value;
  }, {
    data   : {'can edit': 'can edit', 'can view': 'can view'},
    type   : 'select',
    submit : '<button type="submit" class="btn">ok</button>',
    onedit: function(){
      var self = this;
      setTimeout(function(){
        var element = $("select", self)[0];
        if (document.createEvent) {
          var e = document.createEvent("MouseEvents");
          e.initMouseEvent("mousedown", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
          element.dispatchEvent(e);
        } else if (element.fireEvent) {
          element.fireEvent("onmousedown");
        }
      }, 100);
    }
  });

  $('#add-collab').on('submit', function (e) {
    e.preventDefault();
    var collaborator = {
      email:  $('#new-collab').val(),
      type:   $('#new-collab-type').val()
    };

    changeCollaborator(collaborator, function(){
      
      $('#new-collab').val('');
      
      $('#collabs-table')
        .append(collabTemplate({c: collaborator}));

    });
  });

  $('.remove-collab').on('click', function(e){
    e.preventDefault();

    var  row = $(this).parents('tr'),
      email = row.attr('data-email');

    request({
      url:          '/doc/' + window.docId + '/collaborators/' + email,
      method:       'delete',
      type:         'html'
    });

    row.remove();
  });
});