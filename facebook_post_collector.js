var Config = require('./config');
var Collector = require('./collector');
var FB = require('fb');
var util = require('util');

var __DATE_FORMAT = '{yyyy}-{MM}-{dd} {HH}:{mm}:{ss}';

function FacebookPostCollector(options) {
	options = options || {};
	if (!options.cursor)
		throw new Error('Missing cursor');

	this.cursor = options.cursor;
	this.pageId = options.cursor.locationId;
	this.q = 'q' in options ? options['q'] : null
	this.since = options.cursor.newest || null;
	this.until = options.cursor.oldest || null;
	this.limit = options.cursor.limit || 100;
	this.positionColumn = 'created_time'
	this.fields = ['id', 'created_time', 'message', 'from', 'is_popular', 'comments.limit(1).summary(true)', 'likes.limit(1).summary(true)']
	var self = this

	this.parameters = function() {
		params = {fields: self.fields.join(','), limit: self.limit}
		if(self.q)
			params['q'] = self.q
		if(self.since && self.cursor.direction == 'forward') {
			params['since'] = Date.create(self.since).format(__DATE_FORMAT)
		}
		if(self.until && self.cursor.direction == 'backward') {
			params['until'] = Date.create(self.until).format(__DATE_FORMAT)
		}
		return params
	}

	this.readSource = function(callback) {
		FB.api('/' + self.pageId + '/posts', self.parameters(), function(result) {
			if(result.error) {
				callback.call({parent: self}, {contents: null, cursor:null}, result.error);
				return;
			}

			result.data = result.data.filter(function(item) {
				return 'message' in item;
			});
			result.data.forEach(function(item) {
				if(!('comments' in item))
					return item
				item = Object.merge(item, {commentCursor: Object.merge(item.comments.paging, Collector.cursorInfo('created_time', item.comments.data))});
				item.author = {name: item.from.name, id: item.from.id};
				item.body = Object.clone(item.message);
				item.message = undefined;
			});
			forwardParameters = result['paging'] ? Collector.queryParameters(result['paging']['previous']) : {};
			backwardParameters = result['paging'] ? Collector.queryParameters(result['paging']['next']) : {};
			Collector.normalizeContents(result.data, {dateColumn: 'created_time', orderIdColumn: 'created_time'});
			var oldLength = result.data.length;
			if(oldLength > 0) {
				var oldestItem = result.data[result.data.length - 1].orderId;
				result.data = Collector.filterContentsByDate(result.data, self.cursor.direction, self.cursor);
				console.log(oldLength - result.data.length + " item filtered of "+ oldLength +" items.");
			}
			callback.call({parent: self}, {contents: result.data, cursor: Object.merge({forward: forwardParameters, backward: backwardParameters}, Collector.cursorInfo(self.positionColumn, result.data))});
		})
	}
}

module.exports = FacebookPostCollector
