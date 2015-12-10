var FacebookFlowController = require('./facebook_flow_controller');
var EksiSozlukFlowController = require('./eksisozluk_flow_controller');
var RssFlowController = require('./rss_flow_controller');
var TwitterStreamFlowController = require('./twitter_stream_flow_controller');
var Tracker = require('./tracker');
var LoggerStack = require('./logger_stack');

/*
var fbController = new FacebookFlowController({});
fbController.startFlow();

var twController = new TwitterStreamFlowController({});
twController.startFlow();


*/
var esController = new EksiSozlukFlowController({});
esController.startFlow();
