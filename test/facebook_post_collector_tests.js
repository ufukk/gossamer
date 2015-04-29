var assert = require('assert')
var nock = require('nock')
var FacebookPageCollector = require('../facebook_page_collector')

var mockPosts = {
	data: [
		{id: 10001, message: 'test foo I', 'created_time': '2015-04-28T15:39:28+0000', comments: { data: [
			{ id: '101_10001_1', message: 'comments I', created_time: '2015-04-28T15:40:28+0000'} ,
			{ id: '101_10001_2', message: 'comments II', created_time: '2015-04-28T15:49:28+0000'},
			{ id: '101_10001_3', message: 'comments III', created_time: '2015-04-28T15:59:28+0000'},
		], paging: {after: '__after', before: '__before'}}},
		{id: 10002, message: 'test foo II', 'created_time': '2015-04-28T15:42:28+0000'},
		{id: 10003, message: 'test foo III', 'created_time': '2015-04-28T15:49:28+0000'},
		{id: 10004, message: 'test foo IV', 'created_time': '2015-04-28T15:59:28+0000'}
	],
	paging: {
		previous: 'https://graph.facebook.com/101/posts?limit=100&since=10004&__paging_token=token_1_value',
		next: 'https://graph.facebook.com/101/posts?limit=100&until=10001&__paging_token=token_2_value'
	}
}

function mockResult(pageId) {
	nock('https://graph.facebook.com').get('/' + pageId + '/posts?fields=id%2Ccreated_time%2Cmessage%2Cis_popular%2Ccomments.limit(100).summary(true)%2Clikes.limit(1).summary(true)&limit=100').reply(200,
		mockPosts
	)
}

describe('Facebook Page Collector collects data from pages or user profiles', function() {

	it('should throw an error if pageId is not set', function() {
		assert.throws(function() {
			var collector = new FacebookPageCollector()
		}, Error, 'pageId')
	})

	it('should specify fields to retrieve from api', function() {
		var collector = new FacebookPageCollector({pageId: 101})
		assert.ok(Object.equal(collector.fields, ['id', 'created_time', 'message', 'is_popular', 'comments.limit(100).summary(true)', 'likes.limit(1).summary(true)']))
	})

	it('should accept q / since / until / limit parameters and convert to timestamp', function() {
		var collector = new FacebookPageCollector({pageId: 101, q: 'foo', since: '2015-01-01 00:00:00', until: '2015-01-30 00:00:00', limit: 50})
		assert.equal(collector.q, 'foo')
		assert.equal(collector.since, Date.parse('2015-01-01 00:00:00'))
		assert.equal(collector.until, Date.parse('2015-01-30 00:00:00'))
		assert.equal(collector.limit, 50)
		assert.equal(collector.parameters()['q'], 'foo')
		assert.equal(collector.parameters()['since'], '2015-01-01 00:00:00')
		assert.equal(collector.parameters()['until'], '2015-01-30 00:00:00')

		var collector = new FacebookPageCollector({pageId: 101})
		//default limit:100
		assert.equal(collector.parameters()['limit'], 100)
	})

	it('should retrieve posts and matching cursors for post comments', function(done) {
		mockResult(101)
		var collector = new FacebookPageCollector({pageId: 101})
		collector.readSource(function(result) {
			assert.equal(result.contents.length, mockPosts['data'].length)
			
			//cursor
			assert.equal(result.cursor['newest'], Date.parse('2015-04-28T15:59:28+0000'))
			assert.equal(result.cursor['oldest'], Date.parse('2015-04-28T15:39:28+0000'))

			assert.equal(result.cursor['forward']['limit'], 100)
			assert.equal(result.cursor['forward']['since'], 10004)
			assert.equal(result.cursor['forward']['__paging_token'], 'token_1_value')
			
			assert.equal(result.cursor['backward']['limit'], 100)
			assert.equal(result.cursor['backward']['until'], 10001)
			assert.equal(result.cursor['backward']['__paging_token'], 'token_2_value')

			done()
		})
	})

	it('should read comments and retrieve comment cursors for each post', function(done) {
		mockResult(101)

		var collector = new FacebookPageCollector({pageId: 101})
		collector.readSource(function(result) {
			assert.equal(result.contents[0].comments.data.length, 3)
			assert.ok(Object.equal(result.contents[0].commentCursor, {newest: Date.parse('2015-04-28T15:59:28+0000'), oldest: Date.parse('2015-04-28T15:40:28+0000'), after: '__after', before: '__before'}))
			done()
		})
	})
})