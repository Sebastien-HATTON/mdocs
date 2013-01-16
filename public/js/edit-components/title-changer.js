define(function (require) {

  var $ = require('jquery');

  require('jeditable');

  $('h1#name').editable('/doc/' + window.docId + '/title', {
    'cssclass': 'input-title'
  });

});