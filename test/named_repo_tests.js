var assert = require('assert');
var Repo = require('../repository');

describe('Named repositories provide access to a single collection', function() {

	beforeEach(function(done) {
		var repo = Repo.baseRepository;
		repo.remove('cursors', {category: 'test_cursor_'});
		repo.remove('contents', {category: 'test_content_'});
		done();
	});

	it('should provide insert & find methods for Cursors', function(done) {
		var repo = Repo.cursorRepository;
		repo.insert([
			{category: 'test_cursor_', name: '__test 01'},
			{category: 'test_cursor_', name: '__test 02'},
			{category: 'test_cursor_', name: '__test 03'},
		], function(err, result) {
			if(err)
				console.log(err);
		});

		repo.find({category: 'test_cursor_'}, function(err, result) {
			assert.equal(err, null);
			assert.equal(result.length, 3);
			done();
		});
	});

	
	it('should provide insert & find methods for Contents', function(done) {
		var repo = Repo.contentRepository;
		repo.insert([
			{category: 'test_content_', name: '__test 01'},
			{category: 'test_content_', name: '__test 02'},
			{category: 'test_content_', name: '__test 03'},
		], function(err, result) {
			if(err)
				console.log(err);
		});

		repo.find({category: 'test_content_'}, function(err, result) {
			assert.equal(err, null);
			assert.equal(result.length, 3);
			done();
		});
	});
});