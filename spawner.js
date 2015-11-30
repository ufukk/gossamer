var S = (function () {

  var spawnerController = function (options) {
      options = options || {};
      this.number = options.number;
      this.interval = options.interval || 0;
      this.collectorProvider = options.collectorProvider;
      this.collectorDataReceived = options.collectorDataReceived;
      this.collectors = [];
      this.context = options.context || undefined;
      this.runningCollectors = [];

      spawnerController.prototype.addCollectors = function (collectors) {
        this.collectors = this.collectors.concat(collectors);
      }

      spawnerController.prototype.loadCollectorsFromProvider = function (number) {
        var self = this;
        this.collectorProvider(number, function (err, collectors) {
          if(err)
            console.log(err);
          self.addCollectors(collectors);
        });
      }

      spawnerController.prototype.updateCollectors = function() {
        var self = this;
        var count = this.number - this.runningCollectors.length;
        for(i = 0; i < count; i++) {
          if(this.collectors.length == 0) {
            return;
          }
          self.readCollector(self.collectors.splice(0, 1)[0], self.interval * (i + 1));
        }
      }

      spawnerController.prototype.readCollector = function(collector, period) {
        var self = this;
          self.runningCollectors.push(collector);
          setTimeout(function() {
            collector.readSource(function(result, err) {
            self.collectorDataReceived.call(self.context, result, err, collector);
            var index = self.runningCollectors.indexOf(this.parent);
            console.log(index);
            if(index > -1) {
              self.runningCollectors.splice(index, 1);
            }
            self.checkAndUpdateControllers();
          });
          }, period);
      }

      spawnerController.prototype.checkAndUpdateControllers = function() {
        var self = this;
        if(this.collectors.length < this.number) {
          if(typeof(this.collectorProvider) != 'function') {
            return;
          }
          this.collectorProvider.call(self.context, this.number - this.collectors.length, function (collectors, err) {
          if(err)
            console.log(err);

          if(collectors.length == 0) {
            console.log('no collectors');
            return;
          }

          self.addCollectors(collectors);
          self.updateCollectors();
          });
        } else {
          this.updateCollectors();
        }
      }

      spawnerController.prototype.startCollectors = function() {
        this.checkAndUpdateControllers();
      }
    }

  var Spawner = {
    SpawnerController: spawnerController
  };
  return Spawner;
})();

module.exports = S;
