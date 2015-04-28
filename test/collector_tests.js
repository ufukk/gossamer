var assert = require('assert')
var Collector = require('../collector')

describe('Collectors extract content from web', function() {
	it('should accept cursor positions at initialization', function() {
		var collector = new Collector({backwardPosition: 1, forwardPosition: 3})
		assert.equal(collector.backwardPosition, 1)
		assert.equal(collector.forwardPosition, 3)
	})

	it('should return cursor info based on positionColumn value', function() {
		var collector = new Collector({positionColumn: 'date'})
		var cursorInfo = collector.cursorInfo([{id: 10001, date: '01/01/2015 00:10:10'}, {id: 10002, date: '01/01/2015 00:11:10'}, {id: 10003, date: '01/01/2015 00:11:00'}])
		assert.equal(cursorInfo['newest'], Date.parse('01/01/2015 00:11:10'))
		assert.equal(cursorInfo['oldest'], Date.parse('01/01/2015 00:10:10'))
	})

	it('should return idList based on idColumn value', function() {
		var collector = new Collector({idColumn: 'id'})
		var idList = collector.idList([{id: 10001, date: '01/01/2015 00:10:10'}, {id: 10002, date: '01/01/2015 00:11:10'}, {id: 10003, date: '01/01/2015 00:11:00'}])
		assert.equal(idList[0], 10001)
		assert.equal(idList[idList.length - 1], 10003)
	})
})