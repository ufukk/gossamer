var assert = require('assert');
var nock = require('nock');
var EksiSozlukKeywordIndexer = require('../eksisozluk_keyword_indexer');

var output = '<html><body><div class="pager" data-currentpage="1" data-pagecount="3" data-urltemplate="/basliklar/ara"></div> \
<ul class="topic-list" data-timestamp="1010101010"> \
<li><a href="/test-content-10005">test content page I<small>35</small></a></li> \
<li><a href="/test-content-10004">test content page II<small>35</small></a></li> \
<li><a href="/test-content-10003">test content page III<small>35</small></a></li> \
<li><a href="/test-content-10002">test content page IV<small>35</small></a></li> \
<li><a href="/test-content-10001">test content page V<small>35</small></a></li> \
</ul></body></html>';

function mockResult() {
  nock('https://eksisozluk.com').get('/basliklar/ara?searchForm.Keywords=test%20content&searchForm.Author=&searchForm.When.From=&searchForm.When.To=&searchForm.NiceOnly=false&searchForm.SortOrder=Date&p=1').reply(200,
    output
  );
}

describe('EksiSozluk Keyword Indexer finds pages with given term', function() {

  it('should throw an error if cursor info is not complete', function() {
    assert.throws(function() {
      var collector = new EksiSozlukKeywordIndexer();
    }, Error);
  });

  it('should build search url', function() {
    var collector = new EksiSozlukKeywordIndexer({cursor: {}});
    var url = collector.convertSearchTermToUrl('test content');
    assert.equal('https://eksisozluk.com/basliklar/ara?searchForm.Keywords=test%20content&searchForm.Author=&searchForm.When.From=&searchForm.When.To=&searchForm.NiceOnly=false&searchForm.SortOrder=Date&p=1', url);
    assert.equal('https://eksisozluk.com/basliklar/ara?searchForm.Keywords=test%20content&searchForm.Author=&searchForm.When.From=&searchForm.When.To=&searchForm.NiceOnly=false&searchForm.SortOrder=Date&p=2', collector.convertSearchTermToUrl('test content', 2));
  });

  it('should return keyword list', function(done) {
    mockResult();
    var collector = new EksiSozlukKeywordIndexer({cursor: {id: 'test content'}});
    collector.readSource(function(result) {
      assert.equal(result.contents.length, 5);
      assert.equal(result.cursor.currentPage, 1);
      assert.equal(result.cursor.pageCount, 3);
      assert.equal(result.contents[0].id, 'test content page I');
      assert.equal(result.contents[4].id, 'test content page V');
      done();
    });
  });

});
