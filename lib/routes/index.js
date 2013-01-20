module.exports = function (app) {
  require('./docs-routes')(app);
  require('./signin-out')(app);
  require('./auth0-provisioning')(app);
  require('./users-routes')(app);
};