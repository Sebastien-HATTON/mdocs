var docs = require('../docs'),
    mdToHtml = require('node-markdown').Markdown;

var docsmid = require('../middleware/docsmiddleware');

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

  app.get('/doc/:docId', 
    requireAuthentication, 
    docsmid.requireMinimunPermissions('can view'),
    function (req, res) {
      
    if(docs.getMaxPermission(req.user, req.doc) === 'can edit'){
      res.redirect('/edit/' + req.params.docId);
    } else {
      res.redirect('/view/' + req.params.docId);
    }

  });

  app.get('/edit/:docId', 
    requireAuthentication, 
    docsmid.requireMinimunPermissions('can edit'),
    docsmid.loadSnapshot(app),
    function (req, res) {
      
      res.render('edit', {
        title:    'Edit',
        user:     req.user,
        doc:      req.doc,
        env:      process.env.NODE_ENV,
        snapshot: req.docSnapshot,
        baseUrl : process.env.BASE_URL || 'http://localhost:8080'
      });

      //set last access
      docs.update(req.doc, { lastAccess: new Date() });
    });

  app.get('/view/:docId', 
    docsmid.requireMinimunPermissions('can view'),
    docsmid.loadSnapshot(app),
    function (req, res) {
      
      res.render('view', {
        user:  req.user,
        name:  req.doc.name,
        title: req.doc.name || 'untitled',
        html:  mdToHtml(req.docSnapshot)
      });

    });


  app.post('/doc/:docId/title', 
    docsmid.requireMinimunPermissions('can edit'),
    function (req, res) {
    var change = { name: req.body.value };
    docs.update(req.doc, change, function (err) {
      if (err) return res.send(500, err);
      res.send(200, req.body.value);
    });
  });

  app.post('/doc/:docId/collaborators', 
    docsmid.requireMinimunPermissions('can edit'),
    function (req, res) {
      var collab = { 
        email: req.body.email, 
        type:  req.body.type
      };

      docs.changeCollaborator(req.doc, collab, function (err) {
        if (err) return res.send(500, err);
        res.send(200, req.body.value);
      });
    });

  app.post('/doc/:docId/visibility', 
    docsmid.requireMinimunPermissions('can edit'),
    function (req, res) {
      var options = { 
        level: req.body.level,
        type:  req.body.type
      };

      if(req.body.level === 'company'){
        if(req.user.identities[0].isSocial){
          return res.send(401);
        } else {
          options.company = req.user.identities[0].connection;
        }
      }

      docs.changeVisibility(req.doc, options, function (err) {
        if (err) return res.send(500, err);
        res.json(options);
      });
    });

  app.del('/doc/:docId/collaborators/:email', 
    docsmid.requireMinimunPermissions('can edit'),
    function (req, res) {
      docs.removeCollaborator(req.doc, req.params.email, function (err) {
        if (err) return res.send(500, err);
        res.send(200);
      });
    });

};
