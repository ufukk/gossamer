var FacebookFlowController = require('./facebook_flow_controller');
var EksiSozlukFlowController = require('./eksisozluk_flow_controller');
var FlowController = require('./flow_controller');
var Tracker = require('./tracker');
var FB = require('FB');

Tracker.trackKeywords(['galatasaray', 'beşiktaş'], 'eksisozluk');

var controller = new EksiSozlukFlowController({threadCount: 3, threadInterval: 500});
controller.startFlow();