var assert = require('assert');
var ContentTransformer = require('../content_transformer');

describe('Content Transformer update content collections for storing', function() {

  it('should throw an error if source is not given', function () {
    assert.throws(function () {
      var transformer = new ContentTransformer();
    }, Error);
  });

  it('should accept optional `locus` field', function () {
    var transformer = new ContentTransformer({source: 'rss', locus: 'reddit'});
    assert.equal(transformer.locus, 'reddit');
  });

  it('should set`_id` field', function () {
    var transformer = new ContentTransformer({source: 'rss'});
    assert.equal(transformer.prepareId('101'), 'rss#101');
    transformer = new ContentTransformer({source: 'rss', locus: 'reddit'});
    assert.equal(transformer.prepareId('102'), 'rss#reddit#102');
  });

  it('should add `_id` field to transformed object', function () {
    var transformer = new ContentTransformer({source: 'rss', locus: 'reddit'});
    var object = transformer.prepare({id: '101', body: '.content.'});
    assert.equal(object._id, 'rss#reddit#101');
    assert.equal(object.id, '101');
    assert.equal(object.body, '.content.');
  });

  it('should add `collectedAt` field to transformed object', function () {
    var time = Date.now();
    var transformer = new ContentTransformer({source: 'rss', locus: 'reddit'});
    var object = transformer.prepare({id: '101', body: '.content.'});
    assert.ok(object.collectedAt >= time);
  });


});