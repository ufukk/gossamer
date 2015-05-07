require('sugar')

var Collector =  (function() {
	
	return {
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
		},

		queryParameters: function(qstr) {
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
})();

module.exports = Collector