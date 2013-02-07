var docs = require('./docs');
module.exports = function () {
  setInterval(function (){
    docs.reduceOlds(function(){});
  }, 1000 * 60 * 60 * 24);
};