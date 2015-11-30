var Twit = require('twit')
var Collector = require('./collector')
var util = require('util')

function TwitterCollector(options) {
	if(!options.keywords && !options.cursor.id)
		throw new Error('Missing keywords')

	if(!options.cursor)
		throw new Error('Missing cursor')

	this.keywords = options.keywords || options.cursor.id;
	if(!Array.isArray(this.keywords))
		this.keywords = [this.keywords];
	this.cursor = options.cursor
	this.positionColumn = 'id_str'

	var self = this

	TwitterCollector.prototype.cursorParameters = function() {
		if(self.cursor.forward > 0)
			return {since_id: self.cursor.forward};

		if(self.cursor.backward > 0)
			return {max_id: self.cursor.backward};

		return {};
	}

	TwitterCollector.prototype.searchQuery = function() {
		return self.keywords.join(' OR ').trim()
	}

	TwitterCollector.prototype.cursorInfo = function(data) {
		return Object.merge(Collector.cursorInfo(self.positionColumn, data.statuses), {forward: Collector.queryParameters(data.search_metadata.refresh_url).since_id, backward: Collector.queryParameters(data.search_metadata.next_results).max_id});
	}

	TwitterCollector.prototype.readSource = function(callback) {
		var twitter = new Twit({consumer_key: '#', consumer_secret: '#', access_token: '#', access_token_secret: '#'})
		twitter.get('search/tweets', Object.merge({'q': self.searchQuery()}, self.cursorParameters), function(error, data, response) {
			if(error)
				console.log(error)
			Collector.normalizeContents(data.statuses, {dateColumn: 'created_at', columns.orderIdColumn: 'created_at'});
			callback.call({parent: self}, {contents: data.statuses, cursor: self.cursorInfo(data)})
		})
	}
}

module.exports = TwitterCollector