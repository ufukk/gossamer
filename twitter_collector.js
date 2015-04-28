var Twit = require('twit')
var collector = require('./collector')
var util = require('util')

function twitterCollector(options) {
	if(!(options && 'keywords' in options))
		throw new Error('Missing keywords')

	if(!(options && 'cursor' in options))
		throw new Error('Missing cursor')

	collector.call(this, options)
	
	this.keywords = options['keywords']
	this.cursor = options['cursor']
	this.positionColumn = 'id_str'

	var self = this

	twitterCollector.prototype.cursorParameters = function() {
		if(self.cursor['forwardPosition'] > 0)
			return {since_id: self.cursor['forwardPosition']}

		if(self.cursor['backwardPosition'] > 0)
			return {max_id: self.cursor['backwardPosition']}

		return {}
	}

	twitterCollector.prototype.searchQuery = function() {
		return self.keywords.join(' OR ').trim()
	}

	twitterCollector.prototype.cursorInfo = function(data) {
		return Object.merge(collector.prototype.cursorInfo.call(this, data['statuses']), {forward: self.queryParameters(data['search_metadata']['refresh_url'])['since_id'], backward: self.queryParameters(data['search_metadata']['next_results'])['max_id']})
	}

	twitterCollector.prototype.readSource = function(callback) {
		var twitter = new Twit({consumer_key: '#', consumer_secret: '#', access_token: '#', access_token_secret: '#'})
		twitter.get('search/tweets', Object.merge({'q': self.searchQuery()}, self.cursorParameters), function(error, data, response) {
			if(error)
				console.log(error)
			callback({contents: data['statuses'], cursor: self.cursorInfo(data)})
		})
	}
}

util.inherits(twitterCollector, collector)
module.exports = twitterCollector