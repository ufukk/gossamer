var collector = require('./collector')
var util = require('util')
var FB = require('fb')

function FacebookCommentCollector(options) {
	if (!(options && 'id' in options))
		throw new Error('Missing id')

	collector.call(this, options)
	this.id = options['id']
	this.q = 'q' in options ? options['q'] : null
	this.limit = 'limit' in options ? options['limit'] : 100
	this.positionColumn = 'created_time'
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

			callback({contents: result.data, cursor: Object.merge(result.paging, self.cursorInfo(result.data))})
		})
	}
}

util.inherits(FacebookCommentCollector, collector)
module.exports = FacebookCommentCollector