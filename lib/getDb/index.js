var mongodb = require("mongodb"),
    cachedDb;

var EventEmitter = require("events").EventEmitter,
    dbStatus = new EventEmitter();

var dbSettings = require('./connection-data');

function createConnector() {
  var mongoserver = new mongodb.Server(dbSettings.host, dbSettings.port, {
        auto_reconnect: true,
        socketOptions: { keepAlive: 300 },
        poolSize: 10
      });
  
  return new mongodb.Db(dbSettings.name, mongoserver, {safe: true});
}

db_connector = createConnector();

dbStatus.once("connected", function(db){
  console.log("connected to mongodb!");

  cachedDb = db;
  
  db.on("close", function(){
    console.log("connection to mongodb closed");
  });
});


module.exports = function(callback){
  if(!cachedDb){
    dbStatus.once("connected", function(db){
      callback(db);
    });
  }else{
    return process.nextTick(function(){
      return callback(cachedDb);
    });
  }

  if(!db_connector.openCalled){
    console.log('connecting to db');
    db_connector.open(function(err, db){
      if ( err ) {
        console.log('error connecting to the db, exiting');
        throw err;
      }

      if(dbSettings.user && dbSettings.password){
        console.log("authenticating to mongodb");
        db.authenticate(dbSettings.user, dbSettings.password, function(err){
          if(err){
            console.log('database authentication fail');
            throw err;
          }
          dbStatus.emit("connected", db);
        });
      }else{
        dbStatus.emit("connected", db);
      }
    });
    return;
  }
};

module.exports.createConnector = createConnector;