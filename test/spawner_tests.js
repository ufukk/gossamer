var assert = require('assert');
var sinon = require('sinon');
var Spawner = require('../spawner');

var mockCollector = function(options, body, miliseconds) {
      miliseconds = miliseconds || 50;
      var parent = this;
      this.cursor = options.cursor;
      this.readSource = function (callback) {
        setTimeout(function() {
            callback.call({parent: parent}, {contents: {body: body}});
        }, miliseconds);
    }
  }

describe('Spawners create collectors and keep a given number of them alive concurrently', function () {

  it('should accept collectors statically', function () {
    var controller = new Spawner.SpawnerController();
    controller.addCollectors([
      new mockCollector({cursor: {id: 101}}, '', 49),
      new mockCollector({cursor: {id: 102}}, '', 50)
    ]);
    assert.equal(controller.collectors.length, 2);
    assert.equal(controller.collectors[0].cursor.id, 101);
    assert.equal(controller.collectors[1].cursor.id, 102);
  });

  it('should call cursor provider when needed', function (done) {
    var controller = new Spawner.SpawnerController({collectorProvider: function (number, callback) {
      callback(null, [new mockCollector({cursor: {id: 101}})]);
      assert.equal(controller.collectors.length, 1);
      assert.equal(controller.collectors[0].cursor.id, 101);
      done();
    }});
    controller.loadCollectorsFromProvider(10);
  });

  it('should call `collectorDataReceived` when collector returns data', function(done) {
    var controller = new Spawner.SpawnerController({number: 1, collectorDataReceived: function(result) {
      assert.equal(result.contents.body, '.content.');
      done();
    }});
    controller.addCollectors([new mockCollector({cursor: {id: 101}}, '.content.')]);
    controller.startCollectors();
  });

  it('should create given number of collectors', function (done) {
    var controller = new Spawner.SpawnerController({number: 3, collectorDataReceived: function (result) {

    }});
    controller.addCollectors([
      new mockCollector({cursor: {id: 1001}}, '.content.', 150),
      new mockCollector({cursor: {id: 1002}}, '.content.', 151),
      new mockCollector({cursor: {id: 1003}}, '.content.', 152),
      new mockCollector({cursor: {id: 1004}}, '.content.', 153),
      new mockCollector({cursor: {id: 1005}}, '.content.', 154)
    ]);
    assert.equal(controller.collectors.length, 5);
    controller.startCollectors();
    assert.equal(controller.collectors.length, 2);
    assert.equal(controller.runningCollectors.length, 3);
    done();
  });

  it('should keep alive given number of collectors.', function(done) {
    var count = 0;
    var controller = new Spawner.SpawnerController({number: 3, collectorDataReceived: function(result) {
      count++;
    }});
    controller.addCollectors([
      new mockCollector({cursor: {id: 101}}, '.content.', 100),
      new mockCollector({cursor: {id: 102}}, '.content.', 100),
      new mockCollector({cursor: {id: 103}}, '.content.', 100),
      new mockCollector({cursor: {id: 104}}, '.content.', 100),
      new mockCollector({cursor: {id: 105}}, '.content.', 100),
      new mockCollector({cursor: {id: 106}}, '.content.', 100),
      new mockCollector({cursor: {id: 107}}, '.content.', 100),
      new mockCollector({cursor: {id: 108}}, '.content.', 100),
      new mockCollector({cursor: {id: 109}}, '.content.', 100),
      new mockCollector({cursor: {id: 110}}, '.content.', 100)
    ]);

    controller.startCollectors();
    assert.equal(controller.runningCollectors.length, 3);
    assert.equal(controller.runningCollectors[0].cursor.id, 101);
    assert.equal(controller.runningCollectors[2].cursor.id, 103);
    setTimeout(function() {
      assert.equal(controller.runningCollectors.length, 3);
      assert.equal(controller.runningCollectors[0].cursor.id, 104);
      assert.equal(controller.runningCollectors[2].cursor.id, 106);
      done();
    }, 110);
  });

});