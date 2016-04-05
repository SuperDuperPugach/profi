/**
 *
 */
var request = require('request');
var log4js = require('log4js');
var express = require('express');
var connectTimeout = require('connect-timeout');
var url = require('url');
var config = require('../config');

var logger = log4js.getLogger();
var router = express.Router();
var timeout = connectTimeout(config.TIME_LIMIT);

//callback's definitions:
var nullRedirectCb = function(req, res, next) {
    if(req.query.uri) {
        return next();
    }
    res.render('redirect', {status: '', content: ''});
};

var redirectCb = function (req, res, next) {
    var uri = validateUri(req.query.uri);
    logger.info('request to ' + uri);

    request(uri, function reqToQueryUriCb(error, response, body) {
        if(req.timedout) {
            return;
        }
        if (!error && response.statusCode == 200) {
            logger.debug('Successful request to ' + uri);
            return res.render('redirect', {status: 'Success', content: body});
        }
        next(error);
    });
};

//auxiliary functions
var validateUri = function(uriStr) {
    if(!uriStr.includes(config.PROTOCOL)) {
        uriStr = config.PROTOCOL + uriStr;
    }
    return uriStr;
};

router.get('/', timeout, nullRedirectCb, redirectCb);

router.use('/', function redirectLastRouteCb(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

router.use('/', function redirectErrorCb(err, req, res, next) {
    if (req.query.uri) {
    logger.info('Errors occurred during connection to ' + req.query.uri
        + '. ' + err);
    } else {
        logger.info('Errors occurred. ' + err)
    }
    res.status(err.status || 500);
    res.render('redirect', {status: err.toString(), content: ''});
});
module.exports = router;