var FlowController = require('./flow_controller');
var Tracker = require('./tracker');
var RssCollector = require('./rss_collector');

var S = (function() {

  var RssFlowController = function(options) {
    this.source = 'rss';
    this.type = 'page';
    FlowController.apply(this, options);
  }

  RssFlowController.prototype = Object.create(FlowController.prototype);
  RssFlowController.prototype.constructor = RssFlowController;

  RssFlowController.prototype.collectorFromCursor = function(cursor) {
    var collector = new RssCollector({cursor: cursor});
    return collector;
  }

  return RssFlowController;
})();

module.exports = S;
