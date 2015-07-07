var assert = require('assert');
var nock = require('nock');
var FacebookPageIndexer = require('../facebook_page_indexer');

var mockContent = {
  data: [
    {
      "name": "Test Page I",
      "category": "Sports Team",
      "id": "101"
    },
    {
      "name": "Test Page II",
      "category": "Sports Team",
      "id": "102"
    },
    {
      "name": "Test Page III",
      "category": "Sports Team",
      "id": "103"
    },
  ],
  paging: {
   cursors: {
     before: "__before",
     after: "__after"
   },
   next: "https://graph.facebook.com/search?pretty=0&q=galatasaray&type=page&limit=10&after=__after"
  }
}

function mockResult() {
	nock('https://graph.facebook.com').get('/search?q=test&type=page&limit=100').reply(200,
		mockContent
	);
}

describe('FacebookPageIndexer finds pages to track for a given keyword', function() {
  beforeEach(function() {
    mockResult();
  });

  it('should throw an error when `keyword` parameter is missing', function () {
    assert.throws(function () {
      var indexer = new FacebookPageIndexer();
    }, Error);
  });

  it('should set q, type and limit parameters', function () {
    var indexer = new FacebookPageIndexer({keyword: 'test'});
    assert.deepEqual(indexer.parameters(), {q: 'test', type: 'page', limit: 100});
  });

  it('should set before & after parameters if given', function () {
    var indexer = new FacebookPageIndexer({keyword: 'test', cursor: {before: '__before'}});
    assert.deepEqual(indexer.parameters(), {q: 'test', type: 'page', limit: 100, before: '__before'});
    var indexer = new FacebookPageIndexer({keyword: 'test', cursor: {after: '__after'}});
    assert.deepEqual(indexer.parameters(), {q: 'test', type: 'page', limit: 100, after: '__after'});
  });

  it('should return page ids & names and cursor data', function(done) {
    var indexer = new FacebookPageIndexer({keyword: 'test'});
    indexer.readSource(function(result) {
      assert.equal(result.contents.length, 3);
      assert.equal(result.contents[0].id, '101');
      assert.equal(result.contents[2].id, '103');
      assert.equal(result.cursor.before, '__before');
      assert.equal(result.cursor.after, '__after');
      done();
    });
  });


});
