require('sugar')

function collector(options) {
	this.forwardPosition = options.forwardPosition || null
	this.backwardPosition = options.backwardPosition || null
	this.positionColumn = options.positionColumn || null
	this.idColumn = options.idColumn ||  null
	var self = this

	collector.prototype.__cursorInfo = function(column, data) {
		singleColumnList = data.map(function(item) {
			val = item[column]
			return Object.isNumber(val) || /^[0-9]+$/.test(val) ? val : Date.parse(val)
		})
		return {newest: singleColumnList.max(), oldest: singleColumnList.min()}
	}

	collector.prototype.__idList = function(column, data) {
		return data.map(function(item) {
			return item[column]
		})
	}

	collector.prototype.cursorInfo = function(data) {
		return collector.prototype.__cursorInfo.apply(this, [self.positionColumn, data])
	}

	collector.prototype.idList = function(data) {
		return collector.prototype.__idList.apply(this, [self.idColumn, data])
	}

	collector.prototype.queryParameters = function(qstr) {
		qstr = qstr.indexOf('?') > -1 ? qstr.substring(qstr.indexOf('?')) : qstr
		var query = {};
  		var a = qstr.split('&');
  		for (var i in a) {
    		var b = a[i].split('=');
    		query[decodeURIComponent(b[0]).replace(/[^a-zA-Z0-9_\\.]/, '')] = decodeURIComponent(b[1]);
  		}
  		return query;
	}
}

module.exports = collector