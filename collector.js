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

		urlToRequestOptions: function(url) {
			options = {};
			options.hostname = url.substring(url.indexOf('://')+3).substring(0, url.substring(url.indexOf('://')+3).indexOf('/'));
			options.port = url.indexOf('https') == 0 ? 443 : 80;
			options.path = url.substring(url.indexOf('://')+3).substring(url.substring(url.indexOf('://')+3).indexOf('/'));
			options.followRedirect = true;
			return options;
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
		},

		queryString: function(params) {
			if(Object.keys(params).length == 0)
				return '';
			var str = '?';
			Object.keys(params).forEach(function(item) {
				str = str + encodeURIComponent(item) + '=' + encodeURIComponent(params[item]);
			});
			return str;
		},

		normalizeContents: function(contents, columns) {
			contents.forEach(function (item) {
				var val = item[columns.orderIdColumn];
				item.orderId = Object.isNumber(val) || /^[0-9]+$/.test(val) ? val : Date.parse(val);
				item.contentDate = item[columns.dateColumn];
			});
		},

		filterContentsByDate: function(contents, direction, cursor) {
			return contents.filter(function(item) {
				if(cursor.newest && direction == 'forward')
					return item.orderId > cursor.newest;
				if(cursor.oldest && direction == 'backward')
					return item.orderId < cursor.oldest;
				return true;
			});
		}
	}
})();

module.exports = Collector
