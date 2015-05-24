var assert = require('assert');
var RssCollector = require('../rss_collector');
var nock = require('nock')

function mockResult() {
	nock('http://reddit.com').get('/feed/').reply(200,
		mockContents
	)
}

var mockContents = '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel> \
<item> \
	<title>content I</title> \
	<lastBuildDate>Fri, 28 Nov 2014 15:48:14 +0000</lastBuildDate> \
	<pubDate>Fri, 28 Nov 2014 15:48:14 +0000</pubDate> \
	<description><![CDATA[ description I]]></description> \
</item> \
<item> \
	<title>content II</title> \
	<lastBuildDate>Fri, 28 Nov 2014 15:48:14 +0000</lastBuildDate> \
	<pubDate>Fri, 28 Nov 2014 14:48:14 +0000</pubDate> \
	<description><![CDATA[description II]]></description> \
</item> \
<item> \
	<title>content III</title> \
	<lastBuildDate>Thu, 27 Nov 2014 15:48:14 +0000</lastBuildDate> \
	<pubDate>Fri, 28 Nov 2014 15:48:14 +0000</pubDate> \
	<description><![CDATA[description III]]></description> \
</item> \
<item> \
	<title>content IV</title> \
	<lastBuildDate>Wed, 26 Nov 2014 15:48:14 +0000</lastBuildDate> \
	<pubDate>Fri, 28 Nov 2014 15:48:14 +0000</pubDate> \
	<description><![CDATA[description IV]]></description> \
</item></channel></rss>';

describe('RSS collector collects content and links from rss feeds.', function() {

	it('should throw an error if cursor is not set', function() {
		assert.throws(function() {
			var collector = new RssCollector();
		}, Error);
	});

	it('should collect title & description from rss feed', function(done) {
		mockResult()
		var collector = new RssCollector({cursor: {id: 'http://reddit.com/feed/'}});
		collector.readSource(function(result) {
			assert.equal(result.contents.length, 4)
			assert.equal(result.contents[0].description, 'description I')
			assert.equal(result.contents[3].description, 'description IV')

			done()
		})
	});

	it('should return cursor information', function(done) {
		mockResult()
		var collector = new RssCollector({cursor: {id: 'http://reddit.com/feed/'});
		collector.readSource(function(result) {
			assert.equal(result.cursor.newest, Date.parse('Fri, 28 Nov 2014 15:48:14 +0000'))
			assert.equal(result.cursor.oldest, Date.parse('Wed, 26 Nov 2014 15:48:14 +0000'))
			done()
		})
	})

})