define(function (require) {
  var $ = require('jquery');
  var request = require('reqwest');
  var visibilityTmpl = require('js/templates/visibility-row');

  $('#visibility-table').on('click', '.change-level', function (e) {
    e.preventDefault();

    var row = $(this).parents('tr');
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
  
});