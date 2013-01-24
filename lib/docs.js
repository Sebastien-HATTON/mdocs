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

/**
 * return the maximum permission level
 * @param  {Object} user 
 * @param  {Object} doc  
 * @return {String} can edit, can view, none
 */
exports.getMaxPermission = function (user, doc) {
  if( user ){
    if(doc.owner === user._id){
      return 'can edit';
    }

    var userEmails = user.emails.map(function (e) {
      return e.value;
    });

    var collabEntry = doc.collaborators.filter(function (c) {
      return ~userEmails.indexOf(c.email) || c.user_id == user.id;
    })[0];

    if (collabEntry) {
      return collabEntry.type;
    }
    
    if (user.identities && 
        !user.identities[0].isSocial && 
        doc.visibility && 
        doc.visibility.companies[user.identities[0].connection]) {
      return doc.visibility.companies[user.identities[0].connection];
    }
  }

  if(doc.visibility && doc.visibility['public']){
    return doc.visibility['public'];
  }

  return 'none';
};

exports.get = function (docId, done) {
  getDb(function (db) {
    var queryDocument = {
      _id: new ObjectID(docId.toString())
    };
  
    db.collection('documents')
      .findOne(queryDocument, function (err, doc) {
        if (err) return done(err);
        if (!doc) return done(null, null);
        
        done(null, doc);
      });
  });
};

exports.update = function (doc, change, done) {
  getDb(function (db) {
    db.collection('documents')
      .update({
        _id: doc._id
      }, { $set: change } , function (err, r) {
        if (!done) return;
        if (err) return done(err);
        done(null, r);
      });
  });
};

exports.changeCollaborator = function (doc, collab, done) {
  getDb(function (db) {
    doc.collaborators = doc.collaborators || [];
    
    doc.collaborators = doc.collaborators.filter(function (c) {
      return c.email !== collab.email;
    }).concat([collab]);

    db.collection('documents')
      .update({
        _id: doc._id
      }, doc, function (err, r) {
        if (err) return done(err);
        done(null, r);
      });
  });
};

exports.removeCollaborator = function (doc, collabEmail, done) {
  getDb(function (db) {
    doc.collaborators = doc.collaborators || [];
    
    doc.collaborators = doc.collaborators.filter(function (c) {
      return c.email !== collabEmail;
    });

    db.collection('documents')
      .update({
        _id: doc._id
      }, doc, function (err, r) {
        if (err) return done(err);
        done(null, r);
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
            $or:[{
                email: { 
                  $in: (user.emails || []).map(function(e){ return e.value; }) 
                }
              },
              {
                user_id: {$exists: true, $in: [user.id]}
              }]
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
exports.changeVisibility = function (doc, options, done) {
  getDb(function (db) {
    doc.visibility = doc.visibility || {
      companies: {}
    };
    
    if (options.level == 'public') {
      if(options.type == 'none')
        delete doc.visibility['public'];
      else
        doc.visibility['public'] = options.type;
    }else{
      if(options.type === 'none'){
        delete doc.visibility.companies[options.company];
      }else{
        doc.visibility.companies[options.company] = options.type;
      }
    }

    db.collection('documents')
      .update({
        _id: doc._id
      }, doc, function (err, r) {
        if (err) return done(err);
        done(null, r);
      });
  });
};