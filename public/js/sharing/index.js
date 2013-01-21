define(function(require){
  var editCollaborators = require('js/sharing/collaborator-table');
  var newCollaborator   = require('js/sharing/new-collaborator');
  require('js/sharing/visibility');
  
  newCollaborator.on('new', function (c) {
    editCollaborators.appendNew(c);
  });
});