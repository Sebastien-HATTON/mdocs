var getDb = require('./getDb'),
  ObjectID = require('mongodb').ObjectID;

exports.createNew = function(user, done) {
  getDb(function (db) {
    db.collection('documents')
      .insert({
        owner:      user._id,
        createdAt:  new Date(),
        name:       "untitled" 
      }, function (err, r) {
        if (err) return done(err);
        done(null, r[0]._id);
      });
  });
};

exports.getForView = function (user, docId, done) {

  getDb(function (db) {
    var queryDocument = {
      _id: new ObjectID(docId.toString())
    };
  
    db.collection('documents')
      .findOne(queryDocument, function (err, r) {
        if (err) return done(err);
        if (!r) return done(null, null);
        
        if(r.owner === user._id) return done(null, r);
        
        var userEmails = user.emails.map(function (e) {
          return e.value;
        });
        
        var isCollaborator = r.collaborators.some(function (c) {
          return ~userEmails.indexOf(c.email);
        });
        
        if (isCollaborator){ 
          return done(null, r);
        }
        
        done(new Error("insufficient permissions to edit"));
      });
  });
};

exports.getForEdit = function (user, docId, done) {

  getDb(function (db) {
    var queryDocument = {
      _id: new ObjectID(docId.toString())
    };
  
    db.collection('documents')
      .findOne(queryDocument, function (err, r) {
        if (err) return done(err);
        if (!r) return done(null, null);
        
        if(r.owner === user._id) return done(null, r);
        
        var userEmails = user.emails.map(function (e) {
          return e.value;
        });
        
        var isCollaborator = r.collaborators.some(function (c) {
          return c.type === 'can edit' && ~userEmails.indexOf(c.email);
        });
        
        if (isCollaborator){ 
          return done(null, r);
        }
        
        done(new Error("insufficient permissions to edit"));
      });
  });
};

exports.update = function (user, docId, change, done) {
  getDb(function (db) {

    exports.getForEdit(user, docId, function (err, doc) {
      if (err)  return done(err);
      if (!doc) return done(null, 0);
      
      db.collection('documents')
        .update({
          _id: new ObjectID(docId)
        }, { $set: change } , function (err, r) {
          if (err) return done(err);
          done(null, r);
        });

    });
    
  });
};

exports.changeCollaborator = function (user, docId, collab, done) {
  getDb(function (db) {

    exports.getForEdit(user, docId, function (err, doc) {
      if (err)  return done(err);
      if (!doc) return done(null, 0);
      
      doc.collaborators = doc.collaborators || [];
      
      doc.collaborators = doc.collaborators.filter(function (c) {
        return c.email !== collab.email;
      }).concat([collab]);

      db.collection('documents')
        .update({
          _id: new ObjectID(docId)
        }, doc, function (err, r) {
          if (err) return done(err);
          done(null, r);
        });

    });

  });
};

exports.removeCollaborator = function (user, docId, collabEmail, done) {
  getDb(function (db) {
    exports.getForEdit(user, docId, function (err, doc) {
      if (err)  return done(err);
      if (!doc) return done(null, 0);
      
      doc.collaborators = doc.collaborators || [];
      
      doc.collaborators = doc.collaborators.filter(function (c) {
        return c.email !== collabEmail;
      });

      db.collection('documents')
        .update({
          _id: new ObjectID(docId)
        }, doc, function (err, r) {
          if (err) return done(err);
          done(null, r);
        });

    });
  });
};


exports.getAll = function (user, done) {
  var userEmails = user.emails.map(function (e) {
    return e.value;
  });
  getDb(function (db) {
    db.collection('documents')
      .find({
        $or: [
          {
            owner: user._id
          },
          {
            collaborators: {
              $elemMatch: {
                email: { 
                  $in: user.emails.map(function(e){ return e.value; }) 
                }
              }
            }
          }
        ]
      }).toArray(function (err, r) {
        if (err) return done(err);
        r.forEach(function (doc) {

          if(doc.owner === user._id){
            doc.canEdit = true;
            return;
          }
          doc.canEdit = doc.collaborators.some(function (c) {
            return c.type === 'can edit' && ~userEmails.indexOf(c.email);
          });

        });
        done(null, r);
      });
  });

};