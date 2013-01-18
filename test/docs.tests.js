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
              ],
              visibility: {
                companies: {
                  'kluglabs': 'can view',
                  'microsoft': 'can edit'
                }
              }
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

    it('should return error if the user is collaborator but only "can view"', function (done) {
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

    it('should return the doc when the user belongs to a company that can edit', function (done) {
      docs.getForEdit({
        _id: ObjectID.createPk(),
        emails: [{
          type: 'foo', value: 'baz@microsoft.com'
        }],
        identities: [{ connection: 'microsoft'}]
      }, test.docId, function (err, doc) {
        if(err) return done(err);
        doc._id.toString().should.eql(test.docId.toString());
        done();
      });
    });
  });

  
  describe('user can edit doc', function () {
    it('should return true for company-wide editable docs', function(){
       var user = {
        emails: [],
        identities: [{
          connection: 'kluglabs'
        }]
       };
       var doc = {
        owner: 'faa',
        collaborators: [],
        visibility: {
          companies: {
            kluglabs: 'can edit'
          }
        }
       };
       docs.userCanEditDoc(user, doc)
          .should.be.true;
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

    it('should return the doc when the user belongs to a company that can edit', function (done) {
      docs.getForView({
        _id: ObjectID.createPk(),
        emails: [{
          type: 'foo', value: 'baz@microsoft.com'
        }],
        identities: [{ connection: 'microsoft'}]
      }, test.docId, function (err, doc) {
        if(err) return done(err);
        doc._id.toString().should.eql(test.docId.toString());
        done();
      });
    });

    it('should return the doc when the user belongs to a company that can view', function (done) {
      docs.getForView({
        _id: ObjectID.createPk(),
        emails: [{
          type: 'foo', value: 'baz@microsoft.com'
        }],
        identities: [{ connection: 'kluglabs'}]
      }, test.docId, function (err, doc) {
        if(err) return done(err);
        doc._id.toString().should.eql(test.docId.toString());
        done();
      });
    });
  });

  describe('get all' , function () {
    it('should return docs user can read or view', function (done) {
      docs.getAll({
        _id: ObjectID.createPk(),
        emails: [{
          type: 'foo', value: 'foo@bar.com'
        }] 
      }, function (err, docs) {
        if(err) return done(err);
        docs[0].name.should.eql('expenses');
        docs[1].name.should.eql('expenses 2');
        done();
      });
    });

    it('should return docs with company-wide visibility', function (done) {
      var user = {
        identities: [{
          connection: 'kluglabs'
        }],
        emails: [{
          value: 'bob@kluglabs'
        }]
      };

      docs.getAll(user, function (err, docs) {
        if (err) return done(err);
        docs[0].name.should.eql('expenses');
        done();
      });
    });

    it('should not return docs with company-wide visibility but user from other company', function (done) {
      var user = {
        identities: [{
          connection: 'qraftlabs'
        }],
        emails: [{
          value: 'bob@kluglabs'
        }]
      };

      docs.getAll(user, function (err, docs) {
        if (err) return done(err);
        docs.length.should.eql(0);
        done();
      });
    });
  });
});