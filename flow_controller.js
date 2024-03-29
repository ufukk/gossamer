var Repo = require('./repository');
var Tracker = require('./tracker');
var Spawner = require('./spawner');
var ContentTransformer = require('./content_transformer');
var LoggerStack = require('./logger_stack');

var S = (function () {

  var FlowController = function (options) {
    options = options || {};
    this.threadCount = 1;
    this.threadInterval = 500;
    this.contentBuffer = [];
    this.contentBufferSize = 10;
    this.indexerLimit = 1;
    this.indexerTimer = null;
    this.indexerRunning = false;

    FlowController.prototype.fetchCursors = function(number, callback) {
      var self = this;
      Repo.cursorRepository.find({filter: {source: self.source, type :self.type}, sort: {readOrder: 'asc'}, limit: number}, function(err, result) {
        if(err)
          console.log(err);
        result = self.prepareCursorForSpawner(result);
        callback(result, err);
      });
    }

    FlowController.prototype.prepareCursorForSpawner = function(cursors) {
      cursors.forEach(function(cursor) {
        cursor.direction = Tracker.directionForCursor(cursor);
      });
      return cursors;
    }

    FlowController.prototype.runIndexer = function() {
      if(this.indexerRunning)
        return;

      this.indexerRunning = true;
      var self = this;
      Tracker.findCursorsToRead({source: self.source, type: 'keyword', sort: [{readOrder: 1}], limit: self.indexerLimit}, function(result, err) {
        if(err)
          console.log(err);

        var collectors = [];
        result.forEach(function(cursor) {
          cursor.direction = Tracker.directionForCursor(cursor);
          collectors.push(self.getIndexer(cursor));
        });

        var indexSpawner = new Spawner.SpawnerController({number: self.indexerLimit, interval: self.threadInterval});
        indexSpawner.addCollectors(collectors);
        indexSpawner.collectorDataReceived = function(result, err, collector) {
          if(err)
            console.log(err);

          Tracker.trackLocations(result.contents);
          if(indexSpawner.collectors.length == 0 && indexSpawner.runningCollectors.length == 1) {
            Object.merge(collector.cursor, result.cursor);
            self.prepareCursorToSave(collector.cursor);
            self.indexerRunning = false;
            Tracker.updateCursors([collector.cursor], function(err, result) {
                if(err)
                    console.log(err);
            });
          }
        }
        indexSpawner.startCollectors();
      });
    }

    FlowController.prototype.saveContents = function(contents, callback) {
      this.contentBuffer = this.contentBuffer.concat(contents);
      if(this.contentBuffer.length < this.contentBufferSize) {
        console.log('Buffered ' + this.contentBuffer.length + ' items');
        return;
      }
      var buffer = this.contentBuffer.splice(0, this.contentBufferSize);
      var transformer = new ContentTransformer({source: this.source, locus: this.type});
      buffer.forEach(function(item) {
        transformer.prepare(item);
      });

      Repo.contentRepository.bulkUpdate(buffer, function(err, result) {
        if(err) {
          console.log('save error: ');
          console.log(err);
        } else if(callback) {
          callback(err, result);
          console.log('saved ' + buffer.length + ' items.');
        }
      });
    }

    FlowController.prototype.prepareCursorToSave = function(cursor) {
      cursor.direction = undefined;
      cursor.lastCollectedAt = Date.now();
      cursor.readOrder = cursor.priority * cursor.lastCollectedAt / 1000000000000;
    }

    FlowController.prototype.saveCursor = function(cursor, callback) {
      this.prepareCursorToSave(cursor);
      Repo.cursorRepository.save(cursor, function(err, result) {
        if(err) {
          console.log(err);
        }
        if(callback)
          callback(err, result);
      });
    }

    FlowController.prototype.collectorDataReceived = function(result, err, collector) {
      if(err) {
        this.logger.error(err);
      }
      if(result.contents && result.contents.length > 0) {
        this.saveContents(result.contents);
      }
      if(result.cursor) {
        this.saveCursor(Object.merge(collector.cursor, result.cursor));
      }
    }

    FlowController.prototype.collectorProvider = function(number, callback) {
      var self = this;
      self.fetchCursors(number, function(result, err) {
        if(err)
          console.log(err);

        if(result.length == 0)
          callback([]);

        var collectors = [];
        result.forEach(function(cursor) {
          var collector = self.collectorFromCursor(cursor);
          collectors.push(collector);
        });
        callback(collectors);
      });
    }

    FlowController.prototype.startIndexer = function() {
      if(typeof(this.getIndexer) != 'function')
        return;
      if(!this.indexerInterval)
        this.indexerInterval = 3000;
      var self = this;
      this.indexerTimer = setInterval(function() {
        self.runIndexer.call(self);
      }, this.indexerInterval);
    }

    FlowController.prototype.stopIndexer = function() {
      clearInterval(this.indexerTimer);
    }

    FlowController.prototype.startFlow = function() {
      var self = this;
      self.logger = LoggerStack.getFlowLogger(self.source);
      this.spawner = new Spawner.SpawnerController({context: self, collectorProvider: self.collectorProvider, collectorDataReceived: self.collectorDataReceived, number: self.threadCount, interval: self.threadInterval});
      this.spawner.startCollectors();
      //this.startIndexer();
    }
  }

  return FlowController;
})();

module.exports = S;
