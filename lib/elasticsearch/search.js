var url = require('url');
var elastical = require('elastical');
var parsedElasticalUrl = url.parse(process.env.ELASTIC_SEARCH_SERVER || 'http://localhost:9200');
var elasticClient = new elastical.Client(parsedElasticalUrl.hostname, {
  port: parseInt(parsedElasticalUrl.port || '80', 10),
  auth: parsedElasticalUrl.auth
});

module.exports = function (user, query, callback) {
  var queryDocument = {
    query: {
      bool: {
        must: {
          bool: {
            should: [{
                terms: {users: [user.id, user.email]}
              },{
                terms: {companies: user.identities[0].isSocial ? [] : [user.identities[0].connection]}
              }
            ],
            minimum_number_should_match : 1
          }
        },
        should: {
          query_string: {
            fields: ["name^3", "tags^2", "content"],
            query: query
          }
        },
        minimum_number_should_match : 1
      }
    }
  };

  elasticClient.search(queryDocument, callback);
};