var Config = require('./config');
var FB = require('FB');
var Tracker = require('./tracker');

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
    if(this.cursor.before && this.cursor.direction == 'forward')
      params.before = this.cursor.before;
    if(this.cursor.after && this.cursor.direction == 'backward')
      params.after = this.cursor.after;
    return params;
  }

  FacebookPageIndexer.prototype.readSource = function(callback) {
    console.log(this.parameters());
    var self = this;
    FB.api('/search', this.parameters(), function(result, err) {
      if(err)
        console.log(err);

      console.log(result);
      var contents = result.data;
      var locations = [];
      contents.forEach(function(page) {
        locations.push({source: 'facebook', type: 'page', id: page.id, title: page.name});
      });
      callback({contents: locations, cursor: result.paging.cursors});
    });
  }

  return FacebookPageIndexer;
})();

module.exports = S;
