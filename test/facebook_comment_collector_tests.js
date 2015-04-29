var assert = require('assert')
var nock = require('nock')
var FacebookCommentCollector = require('../facebook_comment_collector')

var mockComments = {
	data: [
		{id: 101001, message: 'comment I', created_time: '2015-04-28T15:10:28+0000'},
		{id: 101002, message: 'comment II', created_time: '2015-04-28T15:20:28+0000'},
		{id: 101003, message: 'comment III', created_time: '2015-04-28T15:30:28+0000'},
		{id: 101004, message: 'comment IV', created_time: '2015-04-29T15:40:28+0000'}
	],
	paging: {
		after: '__after',
		before: '__before'
	}
}

function mockResult(postId) {
	nock('https://graph.facebook.com').get('/' + postId + '/comments?limit=100').reply(200,
		mockComments
	)
}

describe('Facebook commment collector, collect object comments according to cursor info', function() {

	it('should throw an error when id is not given', function() {
		assert.throws(function() {
			var collector = new FacebookCommentCollector()
		}, Error)
	})

	it('should accept q, limit parameters', function() {
		var collector = new FacebookCommentCollector({id: 101, q: 'foo', limit: 50})
		assert.equal(collector.q, 'foo')
		assert.equal(collector.limit, 50)
	})

	it('should retrieve comments and cursor data', function(done) {
		mockResult(101)
		var collector = new FacebookCommentCollector({id: 101})
		collector.readSource(function(result) {
			assert.equal(result.contents.length, 4)
			assert.ok(Object.equal(result.cursor, {newest: Date.parse('2015-04-29T15:40:28+0000'), oldest: Date.parse('2015-04-28T15:10:28+0000'), after: '__after', before: '__before'}))
			done()
		})
	})

})