var Collector = require('./collector');
var http = require('http');
var parseString = require('xml2js').parseString
var util = require('util')

function RssCollector(options) {
	var __USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.90 Safari/537.36'

	if(!options.cursor)
		throw new Error('Missing url')
	
	this.url = options.cursor.id
	this.positionColumn = 'lastBuildDate'
	var self = this

	RssCollector.prototype.readSource = function(callback) {
		var output = ''
		http.get(this.url, function(response) {
			var output = ''
			response.on('data', function(chunk) {
				output += chunk
			});
			response.on('end', function() {
				parseString(output, function(error, result) {
					if(error)
						console.log(error)
					var contents = []
					result.rss.channel[0].item.forEach(function(item) {
						contents[contents.length] = {title: item.title[0].trim(), description: item.description[0].trim(), lastBuildDate: item.lastBuildDate[0]}
					})
					callback.call({parent: self}, {contents: contents, cursor: Collector.cursorInfo(self.positionColumn, contents)})
				})
			})
		}, {headers: {'User-Agent': __USER_AGENT}});
	}
}

module.exports = RssCollector