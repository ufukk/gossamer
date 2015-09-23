var Tracker = require('./tracker');
var FlowController = require('./flow_controller');
var EksiSozlukKeywordIndexer = require('./eksisozluk_keyword_indexer');
var EksiSozlukCollector = require('./eksisozluk_collector');

var S = (function() {

  var EksiSozlukFlowController = function(options) {
    this.source = 'eksisozluk';
    this.type = 'page';
    FlowController.apply(this, options);
  }

  EksiSozlukFlowController.prototype = Object.create(FlowController.prototype);
  EksiSozlukFlowController.prototype.constructor = EksiSozlukFlowController;

  EksiSozlukFlowController.prototype.getIndexer = function(cursor) {
    var indexer = new EksiSozlukKeywordIndexer({cursor: cursor});
    return indexer;
  }

  EksiSozlukFlowController.prototype.collectorFromCursor = function(cursor) {
    var collector = new EksiSozlukCollector({cursor: cursor});
    return collector;
  }


  return EksiSozlukFlowController;
})();

module.exports = S;