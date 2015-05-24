var Collector = require('./collector')
var util = require('util')
var FB = require('fb')

function FacebookCommentCollector(options) {
	options = options || {};
	if (!options.cursor)
		throw new Error('Missing cursor');

	this.id = options.cursor.id;
	this.q = options.q || null;
	this.limit = options.cursor.limit || 100;
	this.positionColumn = 'created_time';
	var self = this

	FacebookCommentCollector.prototype.parameters = function() {
		params = {limit: self.limit}
		if(self.q)
			params['q'] = self.q
		return params
	}

	FacebookCommentCollector.prototype.readSource = function(callback) {
		FB.api('/' + self.id + '/comments', self.parameters(), function(result) {
			if(result.error)
				console.log(error)

			callback({contents: result.data, cursor: Object.merge(result.paging, Collector.cursorInfo(self.positionColumn, result.data))})
		})
	}
}

module.exports = FacebookCommentCollector