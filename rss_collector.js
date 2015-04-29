var collector = require('./collector');
var http = require('http');
var parseString = require('xml2js').parseString
var util = require('util')

var __USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.90 Safari/537.36'

function RssCollector(options) {
	if(!options.url)
		throw new Error('Missing url')
	collector.call(this, options)

	this.url = options.url
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
					callback({contents: contents, cursor: self.cursorInfo(contents)})
				})
			})
		}, {headers: {'User-Agent': __USER_AGENT}});
	}
}

util.inherits(RssCollector, collector);
module.exports = RssCollector