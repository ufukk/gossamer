var Twit = require('twit')
var Collector = require('./collector')
var util = require('util')

function TwitterCollector(options) {
	if(!options.keywords)
		throw new Error('Missing keywords')

	if(!options.cursor)
		throw new Error('Missing cursor')

	this.keywords = options.keywords
	this.cursor = options.cursor
	this.positionColumn = 'id_str'

	var self = this

	TwitterCollector.prototype.cursorParameters = function() {
		if(self.cursor['forwardPosition'] > 0)
			return {since_id: self.cursor['forwardPosition']}

		if(self.cursor['backwardPosition'] > 0)
			return {max_id: self.cursor['backwardPosition']}

		return {}
	}

	TwitterCollector.prototype.searchQuery = function() {
		return self.keywords.join(' OR ').trim()
	}

	TwitterCollector.prototype.cursorInfo = function(data) {
		return Object.merge(Collector.cursorInfo(self.positionColumn, data['statuses']), {forward: Collector.queryParameters(data['search_metadata']['refresh_url'])['since_id'], backward: Collector.queryParameters(data['search_metadata']['next_results'])['max_id']})
	}

	TwitterCollector.prototype.readSource = function(callback) {
		var twitter = new Twit({consumer_key: '#', consumer_secret: '#', access_token: '#', access_token_secret: '#'})
		twitter.get('search/tweets', Object.merge({'q': self.searchQuery()}, self.cursorParameters), function(error, data, response) {
			if(error)
				console.log(error)
			callback({contents: data['statuses'], cursor: self.cursorInfo(data)})
		})
	}
}

module.exports = TwitterCollector