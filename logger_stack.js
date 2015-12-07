var winston = require('winston');
var __stack = {};

var LoggerStack = (function() {
    
    var logger = function(source, options) {
        this.source = source;
        this.options = options;
        var self = this;
        this.stream = new winston.Logger({
            transports: [
                new winston.transports.File({filename: 'logs/flows/' + self.source + '.log', json: false})
            ]
        });
    }
    
    logger.prototype.info = function(message) {
        this.stream.log('info', '- %s', message);
    }
    
    logger.prototype.error = function(errorType, errorObject) {
        this.stream.log('error', '%s --- %s', errorType, errorObject);
    }
    
    logger.prototype.warning = function(warningType, warningObject) {
        this.stream.log('warning', '%s --- %s', warningType, warningObject);
    }
    
    var flowLogger = function(source, options) {
        logger.call(this, source, options);
    }
    
    flowLogger.prototype = new logger();
    
    return {
        getFlowLogger: function(source, options) {
            options = options || {};
            if(!__stack[source]) {
                __stack[source] = new flowLogger(source, options);
            }
            return __stack[source];
        }
    }
    
    
})();

module.exports = LoggerStack;