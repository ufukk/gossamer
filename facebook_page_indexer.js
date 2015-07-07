var FB = require('FB');

var S = (function () {

  var FacebookPageIndexer = function (options) {
    options = options || {};
    if(!options.keyword)
      throw new Error('Missing keyword');

    this.cursor = options.cursor || {};
    this.keyword = options.keyword;
    this.limit = options.limit || 100;
  }

  FacebookPageIndexer.prototype.parameters = function() {
    var params = {q: this.keyword, type: 'page', limit: this.limit};
    if(this.cursor.before)
      params.before = this.cursor.before;
    if(this.cursor.after)
      params.after = this.cursor.after;
    return params;
  }

  FacebookPageIndexer.prototype.readSource = function(callback) {
    var self = this;
    FB.api('/search', this.parameters(), function(result) {
      var contents = result.data;
      callback({contents: contents, cursor: result.paging.cursors});
    });
  }

  return FacebookPageIndexer;
})();

module.exports = S;
