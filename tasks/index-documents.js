var url = require('url');

var elastical = require('elastical');
var parsedElasticalUrl = url.parse(process.env.ELASTIC_SEARCH_SERVER || 'http://localhost:9200');
var elasticClient = new elastical.Client(parsedElasticalUrl.hostname, {
  port: parseInt(parsedElasticalUrl.port || '80', 10),
  auth: parsedElasticalUrl.auth
});

var async = require('async');
var getDb = require('../lib/getDb');
var ObjectID = require('mongodb').ObjectID;

function getDocuments(callback){
  getDb(function(db){
    db.collection('documents').find({
      $and: [
        {  
          'visibility.companies' : { $exists: true } 
        },
        {
          $or: [
                  { indexMe: { $exists: false } },
                  { indexMe: true }
          ]
        }
      ]
    }).toArray(callback);
  });
}

function setIndexedFlag(id, callback) {
  getDb(function(db){
    db.collection('documents')
      .update({_id: new ObjectID(id)}, { 
        $set: { indexMe: false } 
      }, callback);
  });
}

function indexDoc(doc, callback){

  var id = doc._id.toString();

  var options = { id: id };
  
  if (doc.visibility && doc.visibility.companies && Object.keys(doc.visibility.companies).length > 0) {
    doc.companies = Object.keys(doc.visibility.companies);
  }

  doc.users = [doc.owner].concat(doc.collaborators.map(function(c){
    return c.user_id || c.email;
  }));

  console.log('indexing ', id);
  
  delete doc._id;
  delete doc.operations;
  delete doc.indexMe;
  delete doc.owner;
  delete doc.collaborators;
  delete doc.visibility;

  elasticClient.index('documents', 'doc', doc, options, function(err){
    if(err) return callback(err);
    setIndexedFlag(id, callback);
  });

}

function execute () {
  getDocuments(function(err, docs){
    async.forEach(docs, indexDoc, function (err){
      if(err){
        console.log('error', err);
      }else{
        console.log('finished indexing without errors');
      }
      process.exit();
    });
  });
}


execute();