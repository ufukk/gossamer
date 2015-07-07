var Collector = require('./collector');
var FB = require('fb');
var util = require('util');

var __DATE_FORMAT = '{yyyy}-{MM}-{dd} {HH}:{mm}:{ss}'

function FacebookPostCollector(options) {
	options = options || {};
	if (!options.cursor)
		throw new Error('Missing cursor');

	this.pageId = options.cursor.id;
	this.q = 'q' in options ? options['q'] : null
	this.since = options.cursor.oldest || null;
	this.until = options.cursor.newest || null;
	this.limit = options.cursor.limit || 100;
	this.positionColumn = 'created_time'
	this.fields = ['id', 'created_time', 'message', 'is_popular', 'comments.limit(100).summary(true)', 'likes.limit(1).summary(true)']
	var self = this

	this.parameters = function() {
		params = {fields: self.fields.join(','), limit: self.limit}
		if(self.q)
			params['q'] = self.q
		if(self.since)
			params['since'] = Date.create(self.since).format(__DATE_FORMAT)
		if(self.until)
			params['until'] = Date.create(self.until).format(__DATE_FORMAT)
		return params
	}

	this.readSource = function(callback) {
		FB.api('/' + self.pageId + '/posts', self.parameters(), function(result) {
			if(result.error)
				console.log(result.error);

			data = result['data'].map(function(item) {
				if(!('comments' in item))
					return item
				item = Object.merge(item, {commentCursor: Object.merge(item.comments.paging, Collector.cursorInfo('created_time', item.comments.data))});
				item.commentCursor.parentCreationDate = Date.parse(item.created_time);
				return item;
			});
			forwardParameters = Collector.queryParameters(result['paging']['previous']);
			backwardParameters = Collector.queryParameters(result['paging']['next']);
			Collector.normalizeContents(data, {dateColumn: 'created_time', orderIdColumn: 'created_time'});
			callback.call({parent: self}, {contents: data, cursor: Object.merge({forward: forwardParameters, backward: backwardParameters}, Collector.cursorInfo(self.positionColumn, result['data']))});
		})
	}
}

module.exports = FacebookPostCollector
