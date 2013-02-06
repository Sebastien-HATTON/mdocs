//Experimental MongoDBStore for ot.js
var url = require('url');
var mongo = require('mongodb');

var ot = require('ot');
var WrappedOperation = ot.WrappedOperation;
var TextOperation    = ot.TextOperation;
var Cursor           = ot.Cursor;
var ObjectID = require('mongodb').ObjectID;
var defaultOptions = {
  host: '127.0.0.1',
  port: 27017,
  stringify: true,
  collection: 'documents',
  auto_reconnect: false };

function MongoDBStore (options, docId, callback) {
  this.docId = new ObjectID(docId);

  //took this enourmous but very common initialization code from
  //https://github.com/kcbanner/connect-mongo/blob/master/lib/connect-mongo.js
  options = options || {};
  if(options.url) {
    var db_url = url.parse(options.url);

    if (db_url.port) {
      options.port = parseInt(db_url.port, 10);
    }
    
    if (db_url.pathname != undefined) {
      var pathname = db_url.pathname.split('/');

      if (pathname.length >= 2 && pathname[1]) {
        options.db = pathname[1];
      }
      
      if (pathname.length >= 3 && pathname[2]) {
        options.collection = pathname[2];
      }
    }
    
    if (db_url.hostname != undefined) {
      options.host = db_url.hostname;
    }

    if (db_url.auth != undefined) {
      var auth = db_url.auth.split(':');

      if (auth.length >= 1) {
        options.username = auth[0];
      }
      
      if (auth.length >= 2) {
        options.password = auth[1];
      }
    }
  }

  if (options.mongoose_connection){
    if (options.mongoose_connection.user && options.mongoose_connection.pass) {
      options.username = options.mongoose_connection.user;
      options.password = options.mongoose_connection.pass;
    }

    this.db = new mongo.Db(options.mongoose_connection.db.databaseName,
                           new mongo.Server(options.mongoose_connection.db.serverConfig.host,
                                            options.mongoose_connection.db.serverConfig.port,
                                            options.mongoose_connection.db.serverConfig.options
                                           ),
                           { safe: true });

  } else {
    if(!options.db) {
      throw new Error('Required MongoStore option `db` missing');
    }

    if (typeof options.db == "object") {
      this.db = options.db; // Assume it's an instantiated DB Object
    }
    else {
      this.db = new mongo.Db(options.db,
                             new mongo.Server(options.host || defaultOptions.host,
                                              options.port || defaultOptions.port,
                                              {
                                                auto_reconnect: options.auto_reconnect ||
                                                  defaultOptions.auto_reconnect
                                              }),
                             { safe: true });
    }
  }
  this.db_collection_name = options.collection || defaultOptions.collection;
  
  var self = this;

  this._get_collection = function(callback) {
    if (self.collection) {
      callback && callback(self.collection);
    } else {
      self.db.collection(self.db_collection_name, function(err, collection) {
        if (err) {
          throw new Error('Error getting collection: ' + self.db_collection_name);
        } else {
          self.collection = collection;
          callback && callback(self.collection);
        }      
      });    
    }
  };
  if (this.db.openCalled) {
    this._get_collection(callback)
  }
  else {
    this.db.open(function(err, db) {
      if (err) {
        throw new Error('Error connecting to database');
      }

      if (options.username && options.password) {
        db.authenticate(options.username, options.password, function () {
          self._get_collection(callback);
        });
      } else {
        self._get_collection(callback);
      }
    });
  }
}

function mapOperation (fromDb) {
  return new WrappedOperation(
    TextOperation.fromJSON(fromDb.o),
    fromDb.c && Cursor.fromJSON(fromDb.c)
  );
}

MongoDBStore.prototype.getOperations = function (options, callback) {
  if(typeof options == 'function') {
    callback = options;
    options = {};
  }

  var self = this;
  self._get_collection(function (collection) {
    if(options.since){
      if (options.since === self.lastOperation) {
        return callback(null, []);
      }
      collection.aggregate([{$match: {_id: self.docId}}, 
                          {$unwind: '$operations'}, 
                          {$skip: options.since}], function (err, result){
                            if(err) return callback(err);
                            console.log('ops from mongodb', result);
                            callback(null, (result || []).map(function(r) {
                              return r.operations;
                            }).map(mapOperation));
                          });
    }else {
      collection.findOne({_id: self.docId}, function (err, result) {
        if(err) return callback(err);
        if(!result) return callback(null, []);
        callback(null, result.operations || []);
      });
    }
  });
};

MongoDBStore.prototype.getDocument = function (callback) {
  var self = this;
  this._get_collection(function (collection) {
    collection.findOne({_id: self.docId}, function (err, result) {
      if(err) return callback(err);
      if(!result) return callback(null, "", 0);
      callback(null, result.content || "", (result.operations || []).length);
    });
  });
};

MongoDBStore.prototype.insertOperation = function (operation, callback) {
  var self = this;
  var cursorInfo = operation.meta ? operation.meta.toJSON() : null;
  var operationInfo = operation.wrapped.toJSON();

  self.getDocument(function (err, content, length) {
    if(err) return callback(err);
    self.lastOperation = length + 1;
    var newContent = operation.apply(content);
    self._get_collection(function (collection) {
      collection.update({_id: self.docId}, {
        $set: {content: newContent, lastUpdate: new Date()},
        $push: {operations: {
          c: cursorInfo,
          o: operationInfo
        }}
      }, { upsert: true }, callback);
    });
  });
};

module.exports = MongoDBStore;