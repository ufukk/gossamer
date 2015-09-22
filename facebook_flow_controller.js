var FlowController = require('./flow_controller');
var FacebookPageIndexer = require('./facebook_page_indexer');
var FacebookPostCollector = require('./facebook_post_collector');
var FacebookCommentCollector = require('./facebook_comment_collector');
var Tracker = require('./tracker');

var S = (function() {

  var FacebookFlowController = function(options) {
    this.source = 'facebook';
    this.type = 'page';
    FlowController.apply(this, options);
  }
  
  FacebookFlowController.prototype = Object.create(FlowController.prototype);
  FacebookFlowController.prototype.constructor = FacebookFlowController;

  FacebookFlowController.prototype.getIndexer = function(cursor) {
    var indexer = new FacebookPageIndexer({keyword: cursor.id, cursor: cursor});
    return indexer;
  }

  FacebookFlowController.prototype.collectorFromCursor = function(cursor) {
    var collector;
    if(cursor.type == 'page')
      collector = new FacebookPostCollector({cursor: cursor});
    if(cursor.type == 'post')
      collector = new FacebookCommentCollector({cursor: cursor});
    return collector;
  }

  FacebookFlowController.prototype.collectorDataReceived = function(result, err) {
    if(err) {
        console.log(err);
      } else {
        this.saveCursor(result.cursor);
        this.saveContents(result.contents, function() {
          var postCursors = [];
          result.contents.forEach(function(post) {
            if(!post.comments)
              return;
            var commentCount = post.comments.summary.total_count;
            if(commentCount > 0) {
              postCursors.push(Tracker.toCursor({source: 'facebook', type: 'post', id: post.id}));
            }
          });
          Tracker.updateCursors(postCursors);
          console.log('saved: ' + result.contents.length + ' content');
        });
      }
    }


  return FacebookFlowController;
})();

module.exports = S;