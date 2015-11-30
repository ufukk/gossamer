var config = require('./config');
var Twit = require('twit');
var Tracker = require('./tracker');
var ContentTransformer = require('./content_transformer');
var FlowController = require('./flow_controller');
require('sugar');

var S = (function() {

  var TwitterStreamFlowController = function(options) {
    FlowController.apply(this, options);
    this.source = 'twitter';
    this.type = 'term';
    this.contentTransformer = new ContentTransformer({source: this.source, type: this.type});
    this.buffer = [];
    this.bufferSize = 10;
    this.stream = null;
    this.cursorInterval = 5000;
    this.cursorTimer = null;
  }

  TwitterStreamFlowController.prototype = Object.create(FlowController.prototype);
  TwitterStreamFlowController.prototype.constructor = TwitterStreamFlowController;

  TwitterStreamFlowController.prototype.findCursors = function(callback) {
    var self = this;
    Tracker.findCursorsToRead({source: 'twitter', type: 'keyword', limit: this.limit}, function(result, err) {
      if(err)
        console.log(err);
      callback.call(self, result);
    });
  }

  TwitterStreamFlowController.prototype.refreshCursors = function() {
    var self = this;
    this.findCursors(function(result) {
      console.log("cursors: " + result.length + "/" + self.cursors.length);
      if(result.length != self.cursors.length) {
        console.log('keywords refreshed...');
        self.cursors = result;
        this.startStream();
      }
    });
  }

  TwitterStreamFlowController.prototype.prepareTweets = function(data) {
    var self = this;
    data.forEach(function(item) {
      self.cursors.forEach(function (cursor) {
        if(!item.keywords)
          item.keywords = [];
        if(item.keywords.indexOf(cursor.id) == -1)
          item.keywords.push(cursor.id);
      });
      item.author = {name: item.user.screen_name, id: item.user.id};
      item.body = item.text;
      item.text = undefined;
      self.contentTransformer.prepare(item);
    });
  }

  TwitterStreamFlowController.prototype.onStreamError = function(err) {
    console.log(err);
  }

  TwitterStreamFlowController.prototype.onStreamDataReceived = function(data) {
    var self = this;
    this.buffer.push(data);
    if(this.buffer.length >= this.bufferSize) {
      var bufferToSend = this.buffer.splice(0, this.bufferSize);
      this.prepareTweets(bufferToSend);
      this.saveContents(bufferToSend);
      var updatedCursors = this.mapTweetsWithCursors(bufferToSend);
      updatedCursors.forEach(function(cursor) {
        self.prepareCursorToSave(cursor);
      });
      Tracker.updateCursors(updatedCursors);
      console.log('added: ' + bufferToSend.length + ' tweets');
    }
  }

  TwitterStreamFlowController.prototype.mapTweetsWithCursors = function(data) {
    var self = this;
    var updatedCursors = [];
    data.forEach(function (tweet) {
      self.cursors.forEach(function (cursor) {
        if(tweet.body.indexOf(cursor.id) > -1) {
          var orderValue = Date.parse(tweet.created_at);
          var addToList = false;
          if(orderValue > cursor.newest || !cursor.newest || cursor.newest == 0) {
              cursor.newest = orderValue;
              addToList = true;
          }
          if(orderValue < cursor.oldest || !cursor.oldest || cursor.oldest == 0) {
            cursor.oldest = orderValue;
            addToList = true;
          }
          if(addToList || !updatedCursors.indexOf(cursor))
            updatedCursors.push(cursor);
        }
      })
    });
    return updatedCursors;
  }

  TwitterStreamFlowController.prototype.cursorsToKeywords = function() {
    var keywords = [];
    this.cursors.forEach(function (cursor) {
      keywords.push(cursor.locationId);
    });
    return keywords;
  }

  TwitterStreamFlowController.prototype.startStream = function() {
    var self = this;
    if(self.stream != null) {
      self.stream.stop();
    }
    self.findCursors(function(result) {
      self.cursors = result;
      var twitter = new Twit(config.Twitter);
      var keywords = self.cursorsToKeywords();
      console.log(keywords);
      self.stream = twitter.stream('statuses/filter', {track: keywords, lang: 'tr'});
      self.stream.on('tweet', function(data) {
        self.onStreamDataReceived.call(self, data);
      });
      self.stream.on('error', function(error) {
        self.onStreamError.call(self, error);
      });
    });
  }

  TwitterStreamFlowController.prototype.startFlow = function() {
    var self = this;
    this.cursorTimer = setInterval(function() {
      self.refreshCursors();
    }, self.cursorInterval);
    this.startStream();
  }

  return TwitterStreamFlowController;

})();

module.exports = S;
