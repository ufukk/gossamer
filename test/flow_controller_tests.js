var assert = require('assert');
var sinon = require('sinon');
var FlowController = require('../flow_controller');
var Repo = require('../repository');

var mockData = [
  {source: 'facebook', type: 'page', id: 101},
  {source: 'facebook', type: 'page', id: 102},
  {source: 'facebook', type: 'page', id: 103},
];

describe('Flow Controllers mediate between collectors, data store and Spawners', function () {

  beforeEach(function() {
    var stub = sinon.stub(Repo.cursorRepository, 'find', function(q, callback) {
      callback(mockData);
    });

    sinon.spy(Repo.cursorRepository, 'insert');
    sinon.spy(Repo.cursorRepository, 'insertOrUpdate');
  });

  afterEach(function() {
    Repo.cursorRepository.find.restore();
    Repo.cursorRepository.insert.restore();
    Repo.cursorRepository.insertOrUpdate.restore();
  });


  it('should accept parameters: `threadCount, cursorCount, indexerInterval, threadInterval` at initialization', function () {
    var controller = new FlowController({threadCount: 3, threadInterval: 100});
    assert.equal(controller.threadCount, 3);
    assert.equal(controller.threadInterval, 100);
  });

  it('should read cursors from store', function () {
    var controller = new FlowController({threadCount: 3, threadInterval: 100});
    controller.source = 'facebook';
    controller.type = 'page';
    controller.fetchCursors(function() {

    });
    var call = Repo.cursorRepository.find.getCall(0);
    assert.deepEqual(call.args[0], {filter: {source: 'facebook', type :'page'}, sort: [{readOrder: 1}], limit: 3});
  });

  it('should set `direction` parameter to cursors', function(done) {
    var controller = new FlowController({threadCount: 3, threadInterval: 100});
    controller.source = 'facebook';
    controller.type = 'page';
    controller.fetchCursors(3, function(results) {
      assert.equal(results.length, 3);
      assert.equal(results[0].id, 101);
      assert.equal(results[2].id, 103);
      assert.ok(results[0].direction == 'forward' || results[0].direction == 'backward');
      assert.ok(results[2].direction == 'forward' || results[2].direction == 'backward');
      done();
    });
  });


});
