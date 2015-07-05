var S = (function () {

  var spawnerController = function (options) {
      options = options || {};
      this.number = options.number;
      this.collectorProvider = options.collectorProvider;
      this.collectorDataReceived = options.collectorDataReceived;
      this.collectors = [];
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
          if(this.collectors.length == 0)
            return;
          var collector = self.collectors.splice(0, 1)[0];
          this.runningCollectors.push(collector);
          collector.readSource(function(result) {
            self.collectorDataReceived(result);
            var index = self.runningCollectors.indexOf(this.parent);
            if(index > -1) {
              self.runningCollectors.splice(index, 1);
            }
            self.updateCollectors();
          });
        }
      }

      spawnerController.prototype.checkAndUpdateControllers = function() {
        var self = this;
        if(this.collectors.length < this.number) {
          this.collectorProvider(this.number - this.collectors.length, function (err, collectors) {
          if(err)
            console.log(err);
          
          self.addCollectors(collectors);
          self.updateCollectors();
          });
        } else {
          this.updateCollectors();
        }
      }

      spawnerController.prototype.startCollectors = function() {
        this.updateCollectors();
      }
    }

  var Spawner = {
    SpawnerController: spawnerController
  };
  return Spawner;
})();

module.exports = S;