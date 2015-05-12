var Repository = (function() {
	require('sugar');
	var url = 'webcollector';
	var mongojs = require('mongojs');
	var db = mongojs(url);

	db.on('error', function(err) {
		console.log(err);
	});

	var baseRepository = function() {

		baseRepository.prototype.getContext = function(args) {
			var ctx = {};
			ctx.collectionName = this.collectionName || args[0];
			ctx.query = !('collectionName' in this) && args.length > 1 ? args[1] : args[0];
			for(i = 0; i < args.length; i++) {
				if(typeof(args[i]) == 'function')
					ctx.callback = args[i];
			}
			return ctx;
		}

		baseRepository.prototype.remove = function() {
			var ctx = this.getContext(arguments);
			db.collection(ctx.collectionName).remove(ctx.query, function(err, result) {
				if(err)
					console.log(err);
				if(ctx.callback)
					ctx.callback(err, result);
			});
		}

		baseRepository.prototype.find = function() {
			var ctx = this.getContext(arguments);
			var cursor = db.collection(ctx.collectionName).find(ctx.query.filter || ctx.query);
			if(ctx.query.sort)
				cursor = cursor.sort(ctx.query.sort);
			if(ctx.query.limit)
				cursor = cursor.limit(ctx.query.limit);
			cursor.toArray(ctx.callback);
		}

		baseRepository.prototype.findOne = function() {
			var ctx = this.getContext(arguments);
			db.collection(ctx.collectionName).findOne(ctx.query, ctx.callback);
		}

		baseRepository.prototype.findById = function() {
			var ctx = this.getContext(arguments);
			db.collection(ctx.collectionName).findOne({_id: ctx.query}, ctx.callback);
		}		

		baseRepository.prototype.count = function() {
			var ctx = this.getContext(arguments);
			db.collection(ctx.collectionName).count(ctx.query, ctx.callback);
		}

		baseRepository.prototype.save = function() {
			var ctx = this.getContext(arguments);
			db.collection(ctx.collectionName).save(ctx.query, ctx.callback);
		}

		baseRepository.prototype.insert = function() {
			var ctx = this.getContext(arguments);
			db.collection(ctx.collectionName).insert(ctx.query, ctx.callback);
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