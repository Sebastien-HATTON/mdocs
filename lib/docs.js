var getDb = require('./getDb');
var ObjectID = require('mongodb').ObjectID;

var moment = require('moment');
var async = require('async');

var docs = module.exports = {};

docs.createNew = function(user, done) {
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

docs.reduceOperations = function (docId, callback) {
  docs.get(docId, function (err, document) {
    console.log('reducing', document.operations.length, 'operations');
    document.operations = [{
      o: [document.content]
    }];
    docs.update(document, {operations: document.operations}, callback);
  });
};

docs.reduceOlds = function (callback) {
  getDb(function (db) {
    db.collection('documents').find({ 
      lastUpdate: {
        $lt: moment().subtract('days', 7).toDate()
      },
      'operations.1': {
        $exists: true //items with more than one operation
      }
    }).toArray(function (err, documents) {
      console.log(err);
      if (err) return callback(err);
      console.log('reducing', documents.length, 'document');
      var ids = documents.map(function(d) {return d._id.toString(); });
      async.forEach(ids, docs.reduceOperations, callback);
    });
  });
};

/**
 * return the maximum permission level
 * @param  {Object} user 
 * @param  {Object} doc  
 * @return {String} can edit, can view, none
 */
docs.getMaxPermission = function (user, doc) {
  if( user ){
    if(doc.owner === user._id){
      return 'can edit';
    }

    var userEmails = (user.emails || []).map(function (e) {
      return e.value;
    });

    var collabEntry = doc.collaborators.filter(function (c) {
      return ~userEmails.indexOf(c.email) || c.user_id == user.id;
    })[0];

    if (collabEntry) {
      return collabEntry.type;
    }

    //mongodb doesn't allow dots in fields.
    var companyslug = user.identities && user.identities[0].connection.replace(/\.|\$/g, '-');
    
    if (user.identities && 
        !user.identities[0].isSocial && 
        doc.visibility && 
        doc.visibility.companies[companyslug]) {
      return doc.visibility.companies[companyslug];
    }
  }

  if(doc.visibility && doc.visibility['public']){
    return doc.visibility['public'];
  }

  return 'none';
};

docs.get = function (docId, done) {
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

docs.update = function (doc, change, done) {
  getDb(function (db) {
    db.collection('documents')
      .update({
        _id: new ObjectID(doc._id.toString())
      }, { $set: change } , function (err, r) {
        if (!done) return;
        if (err) return done(err);
        done(null, r);
      });
  });
};

docs.changeCollaborator = function (doc, collab, done) {
  doc.collaborators = doc.collaborators || [];
  
  doc.collaborators = doc.collaborators.filter(function (c) {
    return c.email !== collab.email;
  }).concat([collab]);

  docs.update(doc, { 
    collaborators: doc.collaborators 
  }, function (err, r) {
    if (err) return done(err);
    done(null, r);
  });
};

docs.removeCollaborator = function (doc, collabEmail, done) {
  doc.collaborators = doc.collaborators || [];
  
  doc.collaborators = doc.collaborators.filter(function (c) {
    return c.email !== collabEmail;
  });

  docs.update(doc, { 
    collaborators: doc.collaborators 
  }, function (err, r) {
    if (err) return done(err);
    done(null, r);
  });
};

docs.getAll = function (user, options, done) {

  if(typeof options == 'function') {
    done = options;
    options = null;
  }

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
    //mongodb doesn't allow dots in fields.
    var companyslug = user.identities[0].connection.replace(/\.|\$/g, '-');
    companyWideFilter['visibility.companies.' + companyslug] = {$exists: true};
    queryDocument.$or.push(companyWideFilter);
  }

  if (options && options.inTag) {
    queryDocument = {$and: [queryDocument, {
      tags: options.inTag
    }]};
  }
  
  if (options && options.ids) {
    queryDocument = {$and: [queryDocument, {
      _id: { $in: options.ids.map(function(i){ return new ObjectID(i); }) }
    }]};
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
docs.changeVisibility = function (doc, options, done) {
  doc.visibility = doc.visibility || {
    companies: {}
  };
  
  if (options.level == 'public') {
    if(options.type == 'none')
      delete doc.visibility['public'];
    else
      doc.visibility['public'] = options.type;
  }else{

    //mongodb doesn't allow dots in fields.
    var companyslug = options.company.replace(/\.|\$/g, '-');
    if(options.type === 'none'){
      delete doc.visibility.companies[companyslug];
    }else{
      doc.visibility.companies[companyslug] = options.type;
    }
  }

  docs.update(doc, { 
      visibility: doc.visibility,
      indexMe: true
    }, function (err, r) {
      if (err) return done(err);
      done(null, r);
    });
};

docs.del = function (docId, callback) {
  getDb(function (db){
    db.collection('documents')
      .remove({_id: new ObjectID(docId)}, callback);
  });
};