var assert = require('assert');
var sinon = require('sinon');
var Spawner = require('../spawner');

describe('Spawners create collectors and keep a given number of them alive concurrently', function () {
  beforeEach(function() {
    if(Spawner.collectorForCursor.restore)
      Spawner.collectorForCursor.restore();
  });

  it('should return Collector name for a cursor', function () {
    assert.throws(function () {
      Spawner.collectorForCursor({source: '__', type: '_'});
    }, Error);

    var collector = Spawner.collectorForCursor({source: 'fb', type: 'page', id: 101});
    assert.equal(collector.name, 'FacebookPageCollector');

    collector = Spawner.collectorForCursor({source: 'fb', type: 'post', id: 1001});
    assert.equal(collector.name, 'FacebookCommentCollector');
  });

  it('should accept cursors statically', function () {
    var controller = new Spawner.SpawnerController();
    controller.addCursors([
      {source: 'fb', type: 'page', id: 101},
      {source: 'fb', type: 'page', id: 102}
    ]);
    assert.equal(controller.cursors.length, 2);
    assert.equal(controller.cursors[0].id, 101);
    assert.equal(controller.cursors[1].id, 102);
  });

  it('should call cursor provider when needed', function (done) {
    var controller = new Spawner.SpawnerController({cursorProvider: function (number, callback) {
      callback(null, [{source: 'fb', type: 'page', id: 101}]);
      assert.equal(controller.cursors.length, 1);
      assert.equal(controller.cursors[0].id, 101);
      done();
    }});
    controller.loadCursorsFromProvider(10);
  });

  it('should call `collectorDataReceived` when collector returns data', function(done) {
    var stub = sinon.stub(Spawner, 'collectorForCursor', function(cursor) {
      return function(options) {
        var parent = this;
        this.id = options.id;
        this.readSource = function (callback) {
          setTimeout(function() {
            callback.call({parent: parent}, {contents: {body: '.content.'}});
          }, 50);
        }
      }
    });
    var controller = new Spawner.SpawnerController({number: 1, collectorDataReceived: function(result) {
      assert.equal(result.contents.body, '.content.');
      done();
    }});
    controller.addCursors([{source: 'fb', type: 'page', id: 101}]);
    controller.startCollectors();
  });

  it('should create given number of collectors', function (done) {
    var stub = sinon.stub(Spawner, 'collectorForCursor', function(cursor) {
      return function(options) {
        this.id = options.id;
        this.readSource = function (callback) {
          setTimeout(function() {
            callback.call({parent: parent}, []);
          }, 500);
        }
      }
    });


    var controller = new Spawner.SpawnerController({number: 5});
    controller.addCursors([
      {source: 'fb', type: 'page', id: 101},
      {source: 'fb', type: 'page', id: 102},
      {source: 'fb', type: 'page', id: 103},
      {source: 'fb', type: 'page', id: 104},
      {source: 'fb', type: 'page', id: 105}
    ]);
    controller.startCollectors();
    assert.equal(controller.collectors.length, 5);
    assert.equal(controller.collectors[0].id, 101);
    assert.equal(controller.collectors[4].id, 105);
    Spawner.collectorForCursor.restore();
    done();
  });

 
  it('should keep alive given number of collectors.', function(done) {
    var stub = sinon.stub(Spawner, 'collectorForCursor', function(cursor) {
      return function(options) {
        var parent = this;
        this.id = options.id;
        this.readSource = function (callback) {
          setTimeout(function() {
            callback.call({parent: parent}, []);
          }, 100);
        }
      }
    });

    var controller = new Spawner.SpawnerController({number: 3, collectorDataReceived: function(result) {
      //
    }});
    controller.addCursors([
      {source: 'fb', type: 'page', id: 101},
      {source: 'fb', type: 'page', id: 102},
      {source: 'fb', type: 'page', id: 103},
      {source: 'fb', type: 'page', id: 104},
      {source: 'fb', type: 'page', id: 105},
      {source: 'fb', type: 'page', id: 106},
      {source: 'fb', type: 'page', id: 107},
      {source: 'fb', type: 'page', id: 108},
      {source: 'fb', type: 'page', id: 109},
      {source: 'fb', type: 'page', id: 110}
    ]);

    controller.startCollectors();
    assert.equal(controller.collectors.length, 3);
    assert.equal(controller.collectors[0].id, 101);
    assert.equal(controller.collectors[2].id, 103);
    setTimeout(function() {
      Spawner.collectorForCursor.restore();
      assert.equal(controller.collectors.length, 3);
      assert.equal(controller.collectors[0].id, 104);
      assert.equal(controller.collectors[2].id, 106);
      done();
    }, 110);
  });

});