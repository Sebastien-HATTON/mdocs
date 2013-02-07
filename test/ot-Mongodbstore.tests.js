var getDb = require('../lib/getDb');
var connectionData = require('../lib/getDb/connection-data');
var MongoDBStore = require('../lib/ot/MongoDBStore');


var ot = require('ot');
var WrappedOperation = ot.WrappedOperation;
var TextOperation    = ot.TextOperation;
var Cursor           = ot.Cursor;


describe.only('mongodbstore for ot.js', function () {
  var mongoStore;

  before(function (done) {
    getDb(function(db){
      db.collection('documents').remove({}, function (err) {
        if(err) return done(err);

        mongoStore = new MongoDBStore({
                        db: getDb.createConnector(),
                        username: connectionData.user,
                        password: connectionData.password,
                        collection: 'documents'
                      }, '50feb7cbf724960200123001', function(){
                        done();
                      });
      
      });
    });
  });

  it('should return all operations after "since"', function (done) {
    var firstOperation =  new WrappedOperation(new TextOperation().insert(" "), null);
    mongoStore.insertOperation(firstOperation, function (err) {
      if(err) return done(err);
      var secondOperation =  new WrappedOperation(new TextOperation().retain(1).insert(" "), null);
      mongoStore.insertOperation(secondOperation, function (err) {
        if(err) return done(err);
        mongoStore.getOperations({since: 0}, function (err, ops) {
          if(err) return done(err);
          console.log(ops);
          done();
        });
      });
    });
  });
});