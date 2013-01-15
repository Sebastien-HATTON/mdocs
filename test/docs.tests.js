var getDb = require('../lib/getDb');
var docs = require('../lib/docs');
var async = require('async');
var ObjectID = require('mongodb').ObjectID;

describe('docs', function () {
  var test = this;

  before(function (done) {
    getDb(function (db) {
      async.series([
        function (cb) {
          db.collection('users')
            .remove({}, cb);
        },
        function (cb) {
          db.collection('documents')
            .remove({}, cb);
        },
        function (cb) {
          db.collection('users')
            .insert({
              displayName: 'jose',
              emails: [
                { type: 'principal', value: 'jfromaniello@gmail.com' }
              ]
            }, function (err, res) {
              if (err) return cb(err);
              test.userId = res[0]._id;
              cb();
            });
        },
        function(cb){
          db.collection('documents')
            .insert({
              name: 'expenses',
              owner: test.userId,
              collaborators: [
                {
                  email: 'foo@bar.com',
                  type:  'can edit'
                },
                {
                  email: 'baz@bar.com',
                  type:  'can view'
                }
              ]
            }, function (err, res){
              if(err) return cb(err);
              test.docId = res[0]._id;
              cb();
            });
        },
        function(cb){
          db.collection('documents')
            .insert({
              name: 'expenses 2',
              owner: test.userId,
              collaborators: [
                {
                  email: 'foo@bar.com',
                  type:  'can view'
                },
                {
                  email: 'baz@bar.com',
                  type:  'can view'
                }
              ]
            }, function (err, res){
              if(err) return cb(err);
              test.doc2Id = res[0]._id;
              cb();
            });
        }
      ], done);
    });
  });

  describe('get for edit' , function () {

    it('should return the doc when the user is collaborator and "can edit"', function (done) {
      docs.getForEdit({
        _id: ObjectID.createPk(),
        emails: [{
          type: 'foo', value: 'foo@bar.com'
        }] 
      }, test.docId, function (err, doc) {
        if (err) return done(err);
        doc.name.should.eql('expenses');
        done();
      });
    });

    it('should return the doc when the user is collaborator (second address)', function (done) {
      docs.getForEdit({
        _id: ObjectID.createPk(),
        emails: [{
          type: 'foo', value: 'fizz@bar.com'
        }, {
          type: 'foo', value: 'foo@bar.com'
        }] 
      }, test.docId, function (err, doc) {
        if (err) return done(err);
        doc.name.should.eql('expenses');
        done();
      });
    });

    it('should return error if the user is collaborator but "can view"', function (done) {
      docs.getForEdit({
        _id: ObjectID.createPk(),
        emails: [{
          type: 'foo', value: 'baz@bar.com'
        }] 
      }, test.docId, function (err) {
        err.message.should.eql("insufficient permissions to edit");
        done();
      });
    });

  });



  describe('get for view' , function () {

    it('should return the doc when the user is collaborator and "can edit"', function (done) {
      docs.getForView({
        _id: ObjectID.createPk(),
        emails: [{
          type: 'foo', value: 'foo@bar.com'
        }] 
      }, test.docId, function (err, doc) {
        if (err) return done(err);
        doc.name.should.eql('expenses');
        done();
      });
    });

    it('should return the doc when the user is collaborator (second address)', function (done) {
      docs.getForView({
        _id: ObjectID.createPk(),
        emails: [{
          type: 'foo', value: 'fizz@bar.com'
        }, {
          type: 'foo', value: 'foo@bar.com'
        }] 
      }, test.docId, function (err, doc) {
        if (err) return done(err);
        doc.name.should.eql('expenses');
        done();
      });
    });

    it('should return error if the user is not collaborator', function (done) {
      docs.getForView({
        _id: ObjectID.createPk(),
        emails: [{
          type: 'foo', value: 'bandalo@bar.com'
        }] 
      }, test.docId, function (err) {
        err.message.should.eql("insufficient permissions to edit");
        done();
      });
    });

  });

  describe('get all' , function () {
    it('should return canEdit true/false', function (done) {
      docs.getAll({
        _id: ObjectID.createPk(),
        emails: [{
          type: 'foo', value: 'foo@bar.com'
        }] 
      }, function (err, docs) {
        docs[0].canEdit.should.be.true;
        docs[0].name.should.eql('expenses');
        docs[1].canEdit.should.be.false;
        docs[1].name.should.eql('expenses 2');
        done();
      });
    });
  });
});