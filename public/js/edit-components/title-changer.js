define(function (require) {

  var $ = require('jquery');

  require('jeditable');

  $('#name').editable('/doc/' + window.docId + '/title', {
    'cssclass': 'input-title'
  });

});