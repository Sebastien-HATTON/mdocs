var search = require('../elasticsearch/search');
var docs = require('../docs');

module.exports = function(app) {
  app.get('/search', app.requireAuthentication, function(req, res) {
    var query = req.query.q;
    search(req.user, query, function(err, result){
      if(err) res.send(500, err);
      
      var ids = result.hits.map(function(hit){
        return hit._id;
      }).slice(0, 10);

      docs.getAll(req.user, {ids: ids}, function (err, docs) {
        if(err) return res.send(500, err);
        res.render('my-docs', {
          title:  'My docs',
          user:   req.user,
          docs:   docs,
          moment: require('moment'),
          search: query
        });
      });
    });
  });
};