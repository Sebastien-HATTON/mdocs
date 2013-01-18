var getDb = require('./getDb'),
  ObjectID = require('mongodb').ObjectID;

exports.createNew = function(user, done) {
  getDb(function (db) {
    db.collection('documents')
      .insert({
        owner:         user._id,
        createdAt:     new Date(),
        name:          "untitled" ,
        collaborators: []
      }, function (err, r) {
        if (err) return done(err);
        done(null, r[0]._id);
      });
  });
};


exports.userCanEditDoc = function (user, doc) {
  var userEmails = user.emails.map(function (e) {
    return e.value;
  });

  if(doc.owner === user._id){
    return true;
  }
  
  if (user.identities && 
      !user.identities[0].isSocial && 
      doc.visibility && 
      doc.visibility.companies[user.identities[0].connection] && 
      doc.visibility.companies[user.identities[0].connection] === 'can edit') {
    return true;
  }

  return doc.collaborators.some(function (c) {
    return c.type === 'can edit' && ~userEmails.indexOf(c.email);
  });
};

function get (forEdit, user, docId, done) {
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
          return (!forEdit || c.type === 'can edit') && ~userEmails.indexOf(c.email);
        });
        
        if (isCollaborator){ 
          return done(null, r);
        }

        if (user.identities && 
            !user.identities[0].isSocial && 
            r.visibility && 
            r.visibility.companies[user.identities[0].connection] && 
            (r.visibility.companies[user.identities[0].connection] === 'can edit' || 
              (r.visibility.companies[user.identities[0].connection] === 'can view') && !forEdit)) {
          //has company wide access
          return done(null, r);
        }
        
        done(new Error("insufficient permissions to edit"));
      });
  });
}

exports.getForView = function (user, docId, done) {
  return get(false, user, docId, done);
};

exports.getForEdit = function (user, docId, done) {
  return get(true, user, docId, done);
};

exports.update = function (user, docId, change, done) {
  getDb(function (db) {

    get(true, user, docId, function (err, doc) {
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

    get(true, user, docId, function (err, doc) {
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
  var queryDocument = {
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
  };

  if(user.identities && !user.identities[0].isSocial){
    var companyWideFilter = {};
    companyWideFilter['visibility.companies.' + user.identities[0].connection] = {$exists: true};
    queryDocument.$or.push(companyWideFilter);
  }

  getDb(function (db) {
    db.collection('documents')
      .find(queryDocument).toArray(function (err, r) {
        if (err) return done(err);
        done(null, r);
      });
  });

};

/**
 * change the visibility of a document
 * @param  {string}   docId    the document identifier
 * @param  {object}   options  {level: [public|company], [company: companyName], type: [none|can view|can edit]}
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
exports.changeVisibility = function (user, docId, options, done) {
  getDb(function (db) {

    get(true, user, docId, function (err, doc) {
      if (err)  return done(err);
      if (!doc) return done(null, 0);
      
      doc.visibility = doc.visibility || {
        companies: []
      };
      
      if (options.level == 'public') {
        doc.visibility['public'] = options.type;
      }else{
        if(options.type === 'none'){
          delete doc.visibility.companies[options.companyName];
        }else{
          doc.visibility.companies[options.companyName] = options.type;
        }
      }

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