var Repository = (function() {
	require('sugar');
	var url = 'localhost:9200';
	var elastic = require('elasticsearch');
	var client = null;
	var dbName = 'webcollector';

	var checkAndConnect = function() {
		if(client == null) {
			client = new elastic.Client({
			  host: url,
			  log: null
			});
		}
	}

	var baseRepository = function() {

		baseRepository.prototype.getContext = function(args) {
			checkAndConnect();
			var ctx = {};
			ctx.collectionName = this.collectionName || args[0];
			ctx.query = !('collectionName' in this) && args.length > 1 ? args[1] : args[0];
			ctx.index = dbName;
			ctx.type = ctx.collectionName;
			if(ctx._id)
				ctx.id = ctx._id;
			ctx.typedQuery = Object.merge(Object.clone(ctx.query), {index: ctx.index, type: ctx.type});
			for(i = 0; i < args.length; i++) {
				if(typeof(args[i]) == 'function')
					ctx.callback = args[i];
			}
			if(args.length > 2)
				ctx.options = args[2];
			return ctx;
		}

		baseRepository.prototype.remove = function() {
			var ctx = this.getContext(arguments);
			client.delete(ctx.typedQuery, function(err, result) {
				if(ctx.callback)
					ctx.callback(err, result);
			});
		}

		baseRepository.prototype.normalizeFilter = function(filter) {
			//defaults to exact match
			if(!filter.filtered) {
				var filterArray = [];
				 Object.keys(filter).forEach(function(key) {
					 var o = {};
					 o[key] = filter[key];
					 filterArray.push({term: o});
				 });
				filter = {filtered: {filter: {bool: {must: filterArray}}}};
			}
			return filter;
		}

		baseRepository.prototype.normalizeRows = function(rows) {
				if(!Array.isArray(rows))
					return rows._source || rows;
				var result = [];
				rows.forEach(function (item) {
					result.push(item._source || item);
				});
				return result;
		}

		baseRepository.prototype.find = function() {
			var ctx = this.getContext(arguments);
			var body = {};
			if(ctx.query.filter) {
				ctx.query.filter = this.normalizeFilter(ctx.query.filter);
				body.query = ctx.query.filter;
			}
			if(ctx.query.sort)
				body.sort = ctx.query.sort;
			if(ctx.query.start)
				body.from = ctx.query.start;
			if(ctx.query.limit)
				body.size = ctx.query.limit;
			var self = this;
			if(body.sort == 'random') {
				//randomize using 'function_score'
				body.sort = undefined;
				body.query = {function_score: {query: body.query, random_score: {}}};
			}
			client.search({index: ctx.index, type: ctx.type, body: body}, function(err, result) {
				ctx.callback(err, result && result != null && result.hits ? self.normalizeRows(result.hits.hits) : null, result);
			})
		}

		baseRepository.prototype.findOne = function() {
			var ctx = this.getContext(arguments);
			client.get(client.typedQuery, function(err, result) {
				ctx.callback(err, result && result != null ? self.normalizeRows(result) : null, result);
			});
		}

		baseRepository.prototype.findById = function() {
			var ctx = this.getContext(arguments);
			var self = this;
			client.get({index: ctx.index, type: ctx.type, id: ctx.query}, function(err, result) {
				ctx.callback(err, result && result != null ? self.normalizeRows(result) : null, result);
			});
		}

		baseRepository.prototype.count = function() {
			var ctx = this.getContext(arguments);
			var body = {};
			if(ctx.query.filter) {
				ctx.query.filter = this.normalizeFilter(ctx.query.filter);
				body.query = ctx.query.filter;
			}
			client.count({index: ctx.index, type: ctx.type, body: body}, function(err, result) {
				ctx.callback(err, result.count, result);
			});
		}

		baseRepository.prototype.save = function() {
			var ctx = this.getContext(arguments);
			var id = Object.clone(ctx.query.id);
			ctx.query.id = undefined;
			client.update({index: ctx.index, type: ctx.type, id: id, body: {doc: ctx.query, doc_as_upsert: true}}, function(err, result) {
				if(ctx.callback)
					ctx.callback(err, result);
			});
		}

		baseRepository.prototype.insert = function() {
			var ctx = this.getContext(arguments);
			client.create({index: ctx.index, type: ctx.type, id: ctx.query.id, body: ctx.query}, function(err, result) {
				if(ctx.callback)
					ctx.callback(err, result);
			});
		}

		/*
		*	Uses elasticsearch bulk operation. Documents must have 'id' or '_id'
		*/
		baseRepository.prototype.bulkUpdate = function() {
			var ctx = this.getContext(arguments);
			var body = [];
			ctx.query = Array.isArray(ctx.query) ? ctx.query : [ctx.query];
			ctx.query.forEach(function(item) {
				body.push({update: {_index: ctx.index, _type: ctx.type, _id: item.id || item._id}});
				body.push({doc: item, doc_as_upsert: true});
			});
			client.bulk({body: body}, function(err, result) {
				if(ctx.callback)
					ctx.callback(err, result);
			});
		}
	}

	var cursorRepository = function() {
		this.collectionName = 'cursors';
	}
	cursorRepository.prototype = new baseRepository();

	var contentRepository = function() {
		this.collectionName = 'contents';
	}
	contentRepository.prototype = new baseRepository();


	return {
		baseRepository: new baseRepository(),
		cursorRepository: new cursorRepository(),
		contentRepository: new contentRepository()
	}
})();

module.exports = Repository;
