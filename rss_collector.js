require('sugar');
var Collector = require('./collector');
var http = require('http');
var parseString = require('xml2js').parseString;

function RssCollector(options) {
	var __USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.90 Safari/537.36'

	if(!options.cursor)
		throw new Error('Missing url')

	this.cursor = options.cursor;
	this.url = options.cursor.locationId;
	this.positionColumn = 'lastBuildDate';
	var self = this;

	RssCollector.prototype.parseAtom = function(rootElement) {
		var contents = [];
		rootElement.feed.entry.forEach(function(item) {
			contents[contents.length] = {id: item.id[0].trim(), title: item.title[0]._.trim(), body: item.summary[0]._.trim(), lastBuildDate: Date.parse(item.published[0])};
		});
		Collector.normalizeContents(contents, {dateColumn: 'lastBuildDate', orderIdColumn: 'lastBuildDate'});
		return contents;
	}

	RssCollector.prototype.parseRss = function(rootElement) {
		var contents = [];
		rootElement.rss.channel[0].item.forEach(function(item) {
			contents[contents.length] = {id: item.guid[0]._.trim(), title: item.title[0].trim(), body: item.description[0].trim(), lastBuildDate: Date.parse(item.pubDate[0])};
		})
		Collector.normalizeContents(contents, {dateColumn: 'lastBuildDate', orderIdColumn: 'lastBuildDate'});
		return contents;
	}

	RssCollector.prototype.readSource = function(callback) {
		var self = this;
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

					var contents = [];
					if(result.rss) {
						contents = self.parseRss(result);
					} else {
						contents = self.parseAtom(result);
					}
					Collector.filterContentsByDate(contents, self.cursor.direction, self.cursor);
					callback.call({parent: self}, {contents: contents, cursor: Collector.cursorInfo(self.positionColumn, contents)});
				})
			})
		}, {headers: {'User-Agent': __USER_AGENT}});
	}
}

module.exports = RssCollector
