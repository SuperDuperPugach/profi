var express = require('express');
var path = require('path');
var log4js = require('log4js');
var redirectRoutes = require('./routes/redirect');
var config = require('./config');

var app = express();
var logger = log4js.getLogger();
app.set('port', config.PORT);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// set routes
app.use('/', redirectRoutes);

var server = app.listen(app.get('port'), function(){
  logger.info( 'Express started on http://localhost:' +
      app.get('port') + '; press Ctrl-C to terminate.' );
});
module.exports = server;

