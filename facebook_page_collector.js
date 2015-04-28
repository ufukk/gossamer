var collector = require('./collector')
var FB = require('fb')

var __DATE_FORMAT = '{yyyy}-{MM}-{dd} {HH}:{mm}:{ss}'

function FacebookPageCollector(options) {
	if (!(options && 'pageId' in options))
		throw new Error('Missing pageId')

	this.pageId = options['pageId']
	this.q = 'q' in options ? options['q'] : null
	this.since = 'since' in options ? Date.parse(options['since']) : null
	this.until = 'until' in options ? Date.parse(options['until']) : null
	this.limit = 'limit' in options ? options['limit'] : 100
	var self = this

	this.parameters = function() {
		params = {limit: self.limit}
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

			callback({contents: result['data']})
		})
	}
}

module.exports = FacebookPageCollector