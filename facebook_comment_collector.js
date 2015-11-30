var Collector = require('./collector')
var util = require('util')
var FB = require('fb')

var __DATE_FORMAT = '{yyyy}-{MM}-{dd} {HH}:{mm}:{ss}';

function FacebookCommentCollector(options) {
	options = options || {};
	if (!options.cursor)
		throw new Error('Missing cursor');

	this.cursor = options.cursor;
	this.id = options.cursor.locationId;
	this.q = options.q || null;
	this.limit = options.cursor.limit || 100;
	this.positionColumn = 'created_time';
	var self = this

	FacebookCommentCollector.prototype.parameters = function() {
		params = {limit: self.limit}
		if(self.q)
			params['q'] = self.q
		if(self.cursor.newest && self.direction == 'forward')
			params['since'] = Date.create(self.cursor.newest).format(__DATE_FORMAT);
		if(self.cursor.oldest && self.direction == 'backward')
			params['until'] = Date.create(self.cursor.oldest).format(__DATE_FORMAT);
		return params
	}

	FacebookCommentCollector.prototype.readSource = function(callback) {
		FB.api('/' + self.id + '/comments', self.parameters(), function(result) {
			if(result.error)
				console.log(error)

			Collector.normalizeContents(result.data, {dateColumn: 'created_time', orderIdColumn: 'created_time'});
			result.data = result.data.filter(function(item) {
				return 'body' in item;
			});
			result.data = Collector.filterContentsByDate(result.data, self.cursor.direction, self.cursor);
			result.data.forEach(function(item) {
				item.body = Object.clone(item.message);
				item.message = undefined;
			});
			callback.call({parent: self}, {contents: result.data, cursor: Object.merge(result.paging, Collector.cursorInfo(self.positionColumn, result.data))})
		})
	}
}

module.exports = FacebookCommentCollector
