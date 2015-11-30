require('sugar');

var S = (function () {

  var ContentTransformer = function (options) {
    options = options || {};
    if(!options.source)
      throw new Error('Source is required');

    this.source = options.source;
    this.locus = options.locus;
  }

  ContentTransformer.prototype.prepareId = function(id) {
    var prefix = !this.locus || this.locus.length < 1 ? this.source + '#' : this.source + '#' + this.locus + '#';
    return prefix + id;
  }

  ContentTransformer.prototype.prepare = function (object) {
    object.id = this.prepareId(object.id);
    object.source = this.source;
    object.locus = this.locus;
    object.collectedAt = Date.now();
    return object;
  }


  return ContentTransformer;

})();

module.exports = S;
