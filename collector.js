require('sugar')

var Collector = {
	cursorInfo: function(column, data) {
		singleColumnList = data.map(function(item) {
			val = item[column]
			return Object.isNumber(val) || /^[0-9]+$/.test(val) ? val : Date.parse(val)
		})
		return {newest: singleColumnList.max(), oldest: singleColumnList.min()}
	},

	idList: function(column, data) {
		return data.map(function(item) {
			return item[column]
		})
	}
}

function collector(options) {
	this.forwardPosition = 'forwardPosition' in options ? options['forwardPosition'] : null
	this.backwardPosition = options['backwardPosition']
	this.positionColumn = 'positionColumn' in options ? options['positionColumn'] : null
	this.idColumn = 'idColumn' in options ? options['idColumn'] : null
	var top = this

	collector.prototype.cursorInfo = function(data) {
		return Collector.cursorInfo.apply(this, [top.positionColumn, data])
	}

	collector.prototype.idList = function(data) {
		return Collector.idList.apply(this, [top.idColumn, data])
	}

	collector.prototype.queryParameters = function(qstr) {
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