var S = (function () {

  var spawnerController = function (options) {
      options = options || {};
      this.number = options.number;
      this.cursors = [];
      this.cursorProvider = options.cursorProvider;
      this.collectorDataReceived = options.collectorDataReceived;
      this.collectors = [];
      var self = this;
      
      spawnerController.prototype.addCursors = function (cursors) {
        this.cursors = cursors;
      }

      spawnerController.prototype.loadCursorsFromProvider = function (number) {
        this.cursorProvider(number, function (err, cursors) {
          if(err)
            console.log(err);
          self.addCursors(cursors);
        });
      }

      spawnerController.prototype.updateCollectors = function() {
        var count = this.number - this.collectors.length;
        var cursors = this.cursors.splice(0, count);
        for(i = 0; i < count; i++) {
          var func = Spawner.collectorForCursor(cursors[i]);
          var collector = new func(cursors[i]);
          self.collectors.push(collector);
          collector.readSource(function(result) {
            self.collectorDataReceived(result);
            var index = self.collectors.indexOf(this.parent);
            if(index > -1) {
              self.collectors.splice(index, 1);
            }
            self.updateCollectors();
          });
        }
      }

      spawnerController.prototype.startCollectors = function() {
        this.updateCollectors();
      }
    }

  var Spawner = {
    collectorForCursorMap: {
      fb: {
        prefix: 'facebook',
        types: {
          page: 'page',
          post: 'comment'
        }
      }
    },

    collectorForCursor: function (cursor) {
      if (!cursor.source || !cursor.type)
        throw new Error('Missing cursor info');

      var sourceMap = Spawner.collectorForCursorMap[cursor.source];
      if (!sourceMap || !sourceMap.types[cursor.type])
        throw new Error('Undefined collector: ' + cursor.source);

      var modulePath = './';
      var moduleName = [sourceMap.prefix, sourceMap.types[cursor.type], 'collector'].join('_');
      return require(modulePath + moduleName);
    },

    SpawnerController: spawnerController
    
};
  return Spawner;
})();

module.exports = S;