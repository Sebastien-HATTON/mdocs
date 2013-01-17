module.exports = function (app) {
  require('./docs-routes')(app);
  require('./signin-out')(app);
};