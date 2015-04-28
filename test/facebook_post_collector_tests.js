var assert = require('assert')
var nock = require('nock')
var FacebookPageCollector = require('../facebook_page_collector')

var mockPosts = {
	data: [
		{id: 10001, message: 'test foo I', 'created_time': '2015-04-28T15:39:28+0000'},
		{id: 10002, message: 'test foo II', 'created_time': '2015-04-28T15:39:28+0000'},
		{id: 10003, message: 'test foo III', 'created_time': '2015-04-28T15:39:28+0000'},
		{id: 10004, message: 'test foo IV', 'created_time': '2015-04-28T15:39:28+0000'}
	]
}

function mockResult(pageId) {
	nock('https://graph.facebook.com').get('/' + pageId + '/posts?limit=100').reply(200,
		mockPosts
	)
}

describe('Facebook Page Collector collects data from pages or user profiles', function() {

	it('should throw an error if pageId is not set', function() {
		assert.throws(function() {
			var collector = new FacebookPageCollector()
		}, Error, 'pageId')
	})

	it('should accept q / since / until / limit parameters and convert to timestamp', function() {
		var collector = new FacebookPageCollector({pageId: 101, q: 'foo', since: '2015-01-01 00:00:00', until: '2015-01-30 00:00:00', limit: 50})
		assert.equal(collector.q, 'foo')
		assert.equal(collector.since, Date.parse('2015-01-01 00:00:00'))
		assert.equal(collector.until, Date.parse('2015-01-30 00:00:00'))
		assert.equal(collector.limit, 50)
		assert.ok(Object.equal(collector.parameters(), {q: 'foo', since: '2015-01-01 00:00:00', until: '2015-01-30 00:00:00', limit: 50}))

		var collector = new FacebookPageCollector({pageId: 101})
		//default limit:100
		assert.ok(Object.equal(collector.parameters(), {limit: 100}))
	})

	it('should retrieve posts and matching cursors for post comments', function(done) {
		mockResult(101)
		var collector = new FacebookPageCollector({pageId: 101})
		collector.readSource(function(result) {
			assert.equal(result.contents.length, mockPosts['data'].length)
			done()
		})
	})

})