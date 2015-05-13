var Tracker = require('../tracker');
var assert = require('assert');
var sinon = require('sinon');
var Repo = require('../repository');

describe('Trackers catalog and classify locations that collectors read', function() {

	var mockData = [];

	beforeEach(function() {
		var stub = sinon.stub(Repo.cursorRepository, 'find', function(q, callback) {
			callback(null, mockData);
		});

		sinon.spy(Repo.cursorRepository, 'insert');
		sinon.spy(Repo.cursorRepository, 'insertOrUpdate');
	});

	afterEach(function() {
		Repo.cursorRepository.find.restore();
		Repo.cursorRepository.insert.restore();
		Repo.cursorRepository.insertOrUpdate.restore();
	});

	it('should validate any location before transforming them', function() {
		assert.throws(function() {
			Tracker.toCursor({source: 'facebook'});
		}, Error);
		assert.throws(function() {
			Tracker.toCursor({source: 'facebook', type: 'page'});
		}, Error);
	});

	it('should generate _id for locations', function() {
		assert.equal('facebook_page_101', Tracker.idForLocation({source: 'facebook', type: 'page', 'id': 101}));
	})

	it('should merge location fields with default cursor properties', function() {
		var cursor = Tracker.toCursor({source: 'facebook', type :'page', 'id': 101});
		assert.equal(cursor.source, 'facebook');
		assert.equal(cursor.type, 'page');
		assert.equal(cursor.id, '101');
		assert.equal(cursor.lastCollectedAt, 0);
		assert.equal(cursor.refreshRate, 0);
		assert.equal(cursor.priority, 1);
		assert.equal(cursor._id, 'facebook_page_101');
	});

	it('should check which locations already exist as a cursor', function(done) {
		mockData = [{_id: 'facebook_page_101'}];
		Tracker.checkCursors([{source: 'facebook', type :'page', 'id': 101}, {source: 'facebook', type :'page', 'id': 10}], function(result) {
			assert.equal(result.facebook_page_101, true);
			assert.equal(result.facebook_page_10, false);
			done();
		});
	});

	it('should save locations as cursors to track', function(done) {
		Tracker.trackLocations([{source: 'facebook', type :'page', 'id': 101}, {source: 'facebook', type :'page', 'id': 10}]);
		var call = Repo.cursorRepository.insert.getCall(0);
		assert.deepEqual(call.args[0], [{source: 'facebook', type :'page', id: 10, _id: 'facebook_page_10', lastCollectedAt: 0, refreshRate: 0, priority: 1}]);
		done();
	});

	it('should set direction to a given cursor', function() {
		var direction = Tracker.directionForCursor({_id: 'facebook_page_101', source: 'fb', newest: 1001, oldest: 991, id: 101});
		assert.ok(['forward', 'backward'].indexOf(direction) > -1);
	});

	it('should find cursors to read for a given source sorted by priority', function(done) {
		assert.throws(function() {
			Tracker.findCursorsToRead({});
		}, Error);
		
		mockData = [{_id: 'facebook_page_101', source: 'fb', newest: 1001, oldest: 991, id: 101}];
		Tracker.findCursorsToRead({source: 'fb'}, function(result) {
			assert.equal(result[0]._id, 'facebook_page_101');
			assert.ok(['forward', 'backward'].indexOf(result[0].direction) > -1);
			done();
		});
	});

	it('should add cursors to repository or update them if they already exist.', function(done) {
		mockData = [{_id: 'fb_page_101', source: 'fb', type: 'page', id: 101, newest: 1001, oldest: 991, lastCollectedAt: Date.parse('01/01/2015 12:00:00'), refreshRate: 0.0001, priority: 1.0001 }];
		Tracker.updateCursors([
			{source: 'fb', type: 'page', id: 101, newest: 1005, oldest: 990, lastCollectedAt: Date.parse('01/05/2015 12:00:00')},
			{source: 'fb', type: 'page', id: 102, newest: 2001, oldest: 1001, id: 102}
		]);
		var call = Repo.cursorRepository.insertOrUpdate.getCall(0);
		assert.deepEqual(call.args[0][0], {_id: 'fb_page_101', source: 'fb', type: 'page', id: 101, newest: 1005, oldest: 990, id: 101, lastCollectedAt: Date.parse('01/05/2015 12:00:00'), refreshRate: 0.0001, priority: 1.0001});
		assert.deepEqual(call.args[0][1], {_id: 'fb_page_102', source: 'fb', type: 'page', id: 102, newest: 2001, oldest: 1001, lastCollectedAt: 0, refreshRate: 0, priority: 1});
		done();
	});
});