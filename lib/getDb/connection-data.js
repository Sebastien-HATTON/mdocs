var url        = require('url'),
    parsedUrl  = url.parse(process.env.DB || 'mongodb://localhost/mdocs');

module.exports = {
  host:     parsedUrl.hostname,
  port:     parseInt(parsedUrl.port || 27017, 10),
  name:     parsedUrl.pathname.substr(1),
  user:     parsedUrl.auth ? parsedUrl.auth.split(':')[0] : null,
  password: parsedUrl.auth ? parsedUrl.auth.split(':')[1] : null
};