var docs = require('../docs'),
    mdToHtml = require('node-markdown').Markdown;

module.exports = function (app) {
  function requireAuthentication(req, res, next){
    if(!req.user){
      req.session.returnTo = req.originalUrl;
      return res.redirect('/login');
    }
    next();
  }

  app.get('/new', requireAuthentication, function (req, res) {
    docs.createNew(req.user, function (err, docId) {
      if(err) return res.send(500, err);
      res.redirect('/edit/' + docId.toString());
    });
  });

  app.get('/my-docs', requireAuthentication, function (req, res) {
    docs.getAll(req.user, function (err, docs) {
      
      if(err) return res.send(500, err);

      res.render('my-docs', {
        title:  'My docs',
        user:   req.user,
        docs:   docs,
        moment: require('moment')
      });

    });
  });

  app.get('/doc/:docId', requireAuthentication, function (req, res) {
    docs.getForView(req.user, req.params.docId, function (err, doc) {
      if (err) return res.send(500, err);
      if (!doc) return res.send(404);
      
      if(docs.userCanEditDoc(req.user, doc)){
        res.redirect('/edit/' + req.params.docId);
      } else {
        res.redirect('/view/' + req.params.docId);
      }
    });
  });

  app.get('/edit/:docId', requireAuthentication, function (req, res) {
    docs.getForEdit(req.user, req.params.docId, function (err, doc) {
    
      if (err) return res.send(500, err);
      if (!doc) return res.send(404);
      
      app.model.getSnapshot(req.params.docId, function (err, data) {
        console.log(doc);
        
        res.render('edit', {
          title:    'Edit',
          user:     req.user,
          doc:      doc,
          env:      process.env.NODE_ENV,
          snapshot: data ? (data.snapshot || '') : '',
          baseUrl : process.env.BASE_URL || 'http://localhost:8080'
        });
      });
      //set last access
      docs.update(req.user, 
        req.params.docId, 
        { lastAccess: new Date() }, 
        function () {});
    
    });
  });

  app.get('/view/:docId', function (req, res) {
    docs.getForView(req.user, req.params.docId, function (err, doc) {
    
      if (err) return res.send(500, err);
      if (!doc) return res.send(404);
      
      app.model.getSnapshot(req.params.docId, function (err, data) {
        if (err) return res.send(500, err);
        res.render('view', {
          user: req.user,
          name: doc.name,
          title: doc.name || 'untitled',
          html: mdToHtml(data.snapshot)
        });
        
      });

    });
  });


  app.post('/doc/:docId/title', function (req, res) {
    var change = { name: req.body.value };
    docs.update(req.user, req.params.docId, change, function (err, updateCount) {
      if (err) return res.send(500, err);
      if (updateCount === 0) return res.send(404);
      
      res.send(200, req.body.value);
    });
  });

  app.post('/doc/:docId/collaborators', function (req, res) {
    var collab = { 
      email: req.body.email, 
      type:  req.body.type
    };

    docs.changeCollaborator(req.user, req.params.docId, collab, function (err, updateCount) {
      if (err) return res.send(500, err);
      if (updateCount === 0) return res.send(404);
      
      res.send(200, req.body.value);
    });
  });

  app.del('/doc/:docId/collaborators/:email', function (req, res) {
    docs.removeCollaborator(req.user, req.params.docId, req.params.email, function (err, updateCount) {
      if (err) return res.send(500, err);
      if (updateCount === 0) return res.send(404);
      
      res.send(200, req.body.value);
    });
  });

};
