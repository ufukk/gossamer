var assert = require('assert')
require('sugar')
var nock = require('nock')
var TwitterCollector = require('../twitter_collector')

var mockTweets = {statuses: [
		{id_str: '100004', text: 'foo IV', created_at: "Sat Apr 25 13:32:18 +0000 2015"},
		{id_str: '100003', text: 'foo III', created_at: "Sat Apr 25 13:32:17 +0000 2015"},
		{id_str: '100002', text: 'foo II', created_at: "Sat Apr 25 13:32:16 +0000 2015"},
		{id_str: '100001', text: 'foo I', created_at: "Sat Apr 25 13:32:15 +0000 2015"}
], search_metadata: {
		max_id_str: '100004',
		since_id: 0,
		next_results: '?max_id=100001&q=%23foo&include_entities=1',
		refresh_url: '?since_id=100004&q=%23foo&include_entities=1'
}}

function mockResult() {
	nock('https://api.twitter.com').get('/1.1/search/tweets.json?q=%23foo').reply(200,
		mockTweets
	)
}

describe('Twitter collector collect data using search API', function() {
	var keywords = ['#foo']

	it('should return error if keywords are not set', function() {
		assert.throws(function() {
			var collector = new TwitterCollector()
		}, Error)
	})

	it('should return error if cursor is not set', function() {
		assert.throws(function() {
			var collector = new TwitterCollector({keywords: keywords})
		}, Error)
	});

	it('should accept cursor.id as keywords', function() {
		var collector = new TwitterCollector({cursor: {forward: 0, backward: 0, id: '#foo'}});
		assert.deepEqual(collector.keywords, ['#foo']);
	});

	it('should set search parameters according to cursor positions', function() {
		var collector = new TwitterCollector({keywords: keywords, cursor:{forward: 10, backward: 0}})
		var params = collector.cursorParameters()
		assert.equal(params['since_id'], 10);
		assert.equal(typeof(params['max_id']), 'undefined');

		var collector = new TwitterCollector({keywords: keywords, cursor:{forward: 0, backward: 10}})
		var params = collector.cursorParameters()
		assert.equal(params['max_id'], 10)
		assert.equal(typeof(params['since_id']), 'undefined')
		
		var collector = new TwitterCollector({keywords: keywords, cursor:{forward: 0, backward: 0}})
		var params = collector.cursorParameters()
		assert.equal(typeof(params['max_id']), 'undefined')
		assert.equal(typeof(params['since_id']), 'undefined')
	})

	it('should join keywords with `OR` to build search query', function() {
		var collector = new TwitterCollector({keywords: ['#foo1', 'foo2'], cursor:{forward: 10, backward: 0}})
		assert.equal(collector.searchQuery(), '#foo1 OR foo2')
	})

	it('should return search results with `contents` key and cursor data with `cursor` key.', function(done) {
		mockResult()
		var collector = new TwitterCollector({keywords: keywords, cursor:{forward: 0, backward: 0}})
		collector.readSource(function(result) {
			assert.equal(result.contents.length, mockTweets.statuses.length)
			//cursor
			assert.equal(result.cursor['newest'], 100004)
			assert.equal(result.cursor['oldest'], 100001)

			//cursor positions
			assert.equal(result.cursor['forward'], 100004);
			assert.equal(result.cursor['backward'], 100001);
			done();
		})
	})




})
