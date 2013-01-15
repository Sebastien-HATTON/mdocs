var getDb = require('./getDb');

exports.findOrCreate = function(user, done){
  getDb(function (db){
    user._id = user.id;

    db.collection('users')
      .update({_id: user.id}, user, {upsert: true}, done);
  });
};

exports.findById = function(id, done) {
  getDb(function (db) {
    db.collection('users')
      .findOne({_id: id}, done);
  });
};