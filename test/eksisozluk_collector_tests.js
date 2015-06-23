var assert = require('assert');
var nock = require('nock');
var EksiSozlukCollector = require('../eksisozluk_collector');

var output = '<html><body><div class="pager" data-currentpage="1" data-pagecount="3"></div> \
<ul id="entry-list"> \
<li data-id="101" data-author="author1" data-author-id="10001" data-flags="share vote msg report entryrequestmove entrymodlog favorite" data-isfavorite="false" data-favorite-count="0" data-comment-count="0"> \
  <div class="content">.test content 1.</div> \
  <footer><div class="feedback"></div><div class="info"><a class="entry-date permalink" href="/entry/101">#101 01.01.2015 15:15</a><a class="entry-author" href="/biri/author1">author1</a></div></footer> \
  <div class="comment-summary"> \
  <div class="comment-pages"> \
  </div> \
</div></li> \
<li data-id="102" data-author="author2" data-author-id="10002" data-flags="share vote msg report entryrequestmove entrymodlog favorite" data-isfavorite="false" data-favorite-count="0" data-comment-count="0"> \
  <div class="content">.test content 2.</div> \
  <footer><div class="feedback"></div><div class="info"><a class="entry-date permalink" href="/entry/101">#102 01.02.2015 15:10</a><a class="entry-author" href="/biri/author1">author1</a></div></footer> \
  <div class="comment-summary"> \
  <div class="comment-pages"> \
  </div> \
</div></li> \
<li data-id="103" data-author="author3" data-author-id="10003" data-flags="share vote msg report entryrequestmove entrymodlog favorite" data-isfavorite="false" data-favorite-count="0" data-comment-count="0"> \
  <div class="content">.test content 3.</div> \
  <footer><div class="feedback"></div><div class="info"><a class="entry-date permalink" href="/entry/101">#103 01.03.2015 15:05</a><a class="entry-author" href="/biri/author1">author1</a></div></footer> \
  <div class="comment-summary"> \
  <div class="comment-pages"> \
  </div> \
</div></li> \
</ul></div> \
</body></html>';

function mockResult() {
  nock('https://eksisozluk.com').get('/test-content?p=2').reply(200,
    output
  );
}

describe('EksiSozlukCollector collects data from eksi sozluk', function () {
  it('should throw an exception if no cursor is given', function () {
    assert.throws(function () {
      var collector = new EksiSozlukCollector();
    }, Error);
  });

  it('should convert non-iso keywords to urls', function () {
    var collector = new EksiSozlukCollector({cursor: {}});
    assert.equal(collector.convertKeywordToUrl('galatasaray beşiktaş'), 'https://eksisozluk.com/galatasaray-besiktas');
    assert.equal(collector.convertKeywordToUrl('galatasaray beşiktaş', {page: 2}), 'https://eksisozluk.com/galatasaray-besiktas?p=2');
    assert.equal(collector.convertKeywordToUrl('galatasaray beşiktaş', {page: 2, direction: 'forward'}), 'https://eksisozluk.com/galatasaray-besiktas?p=3');
  });

  it('should read content & page count', function(done) {
    mockResult();

    var collector = new EksiSozlukCollector({cursor: {keyword: 'test content', page: 2}});
    collector.readSource(function(result) {
      assert.equal(result.contents.length, 3);
      assert.equal(result.contents[0].id, '101');
      assert.equal(result.contents[2].id, '103');
      assert.equal(result.contents[0].author, 'author1');
      assert.equal(result.contents[2].author, 'author3');
      assert.equal(result.contents[0].body, '.test content 1.');
      assert.equal(result.contents[2].body, '.test content 3.');
      assert.equal(result.contents[0].date, Date.parse('01.01.2015 15:15'));
      assert.equal(result.contents[2].date, Date.parse('01.03.2015 15:05'));
      assert.equal(result.cursor.currentPage, 1);
      assert.equal(result.cursor.pageCount, 3);
      assert.equal(result.cursor.newest, Date.parse('01.03.2015 15:05'));
      assert.equal(result.cursor.oldest, Date.parse('01.01.2015 15:15'));
      done();
    });
  });


});