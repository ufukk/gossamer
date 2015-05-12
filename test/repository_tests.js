var assert = require('assert');
var Repo = require('../repository');

describe('Repository provides an interface to store and retrieve contents and cursors', function() {

	afterEach(function(done) {
		var repo = Repo.baseRepository;
		repo.remove('contents', {category: '_test'}, function(err, result) {
			done();
		});
	});
	
	it('should provide a base repository for generic access', function(done) {
		var repo = Repo.baseRepository;
		repo.save('contents', {category: '_test', _id: '__test_content'});
		repo.find('contents', {_id: '__test_content'}, function(err, result) {
			if(err)
				console.log(err);
			assert.equal(result[0]._id, '__test_content');
			done();
		});
	});
	
	it('should provide count option', function(done) {
		var repo = Repo.baseRepository;
		repo.save('contents', {category: '_test', _id: '__test_content'});
		repo.count('contents', {_id: '__test_content'}, function(err, result) {
			assert.equal(result, 1);
			done();
		})
	});

	it('should provide findById method', function(done) {
		var repo = Repo.baseRepository;
		repo.save('contents', {category: '_test', _id: '__test_content'});
		repo.findById('contents', '__test_content', function(err, result) {
			assert.equal(result.category, '_test');
			done();
		});
	})

	it('should provide sort option', function(done) {
		var repo = Repo.baseRepository;
		repo.save('contents', {category: '_test', name: 'BBBB ccccc'});
		repo.save('contents', {category: '_test', name: 'AAAA bbbbb'});
		repo.save('contents', {category: '_test', name: 'CCCC ddddd'});

		repo.find('contents', {filter :{category: '_test'}, sort: {name: 1}}, function(err, result) {
			assert.equal(err, null);
			assert.equal(result.length, 3);
			assert.equal(result[0].name, 'AAAA bbbbb');
			assert.equal(result[1].name, 'BBBB ccccc');
			assert.equal(result[2].name, 'CCCC ddddd');
			done();
		});
	});

	it('should provide limit option', function(done) {
		var repo = Repo.baseRepository;
		repo.save('contents', {category: '_test', name: 'BBBB ccccc'});
		repo.save('contents', {category: '_test', name: 'AAAA bbbbb'});
		repo.save('contents', {category: '_test', name: 'CCCC ddddd'});
		repo.find('contents', {filter: {category: '_test'}, limit: 1}, function(err, result) {
			assert.equal(err, null);
			assert.equal(result.length, 1);
			done();
		});
	});

	it('should allow multiple inserts', function(done) {
		var repo = Repo.baseRepository;
		repo.insert('contents', [
			{category: '_test', name: 'BBBB ccccc'},
			{category: '_test', name: 'AAAA ccccc'},
			{category: '_test', name: 'CCCC ccccc'}
		]);
		repo.find('contents', {filter: {category: '_test'}}, function(err, result) {
			assert.equal(err, null);
			assert.equal(result.length, 3);
			done();
		});
	});
});
