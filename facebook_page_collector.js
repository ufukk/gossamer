var Collector = require('./collector')
var FB = require('fb')
var util = require('util')

var __DATE_FORMAT = '{yyyy}-{MM}-{dd} {HH}:{mm}:{ss}'

function FacebookPageCollector(options) {
	if (!(options && 'pageId' in options))
		throw new Error('Missing pageId')

	this.pageId = options['pageId']
	this.q = 'q' in options ? options['q'] : null
	this.since = 'since' in options ? Date.parse(options['since']) : null
	this.until = 'until' in options ? Date.parse(options['until']) : null
	this.limit = 'limit' in options ? options['limit'] : 100
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
				console.log(result.error)

			data = result['data'].map(function(item) {
				if(!('comments' in item))
					return item
				return Object.merge(item, {commentCursor: Object.merge(item.comments.paging, Collector.cursorInfo('created_time', item.comments.data) )})
			})
			forwardParameters = Collector.queryParameters(result['paging']['previous'])
			backwardParameters = Collector.queryParameters(result['paging']['next'])
			callback({contents: data, cursor: Object.merge({forward: forwardParameters, backward: backwardParameters}, Collector.cursorInfo(self.positionColumn, result['data']))})
		})
	}
}

module.exports = FacebookPageCollector