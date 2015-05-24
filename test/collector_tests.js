var assert = require('assert');
var Collector = require('../collector');

describe('Collectors extract content from web', function () {
  it('should return cursor info based on positionColumn value', function () {
    var cursorInfo = Collector.cursorInfo('date', [{id: 10001, date: '01/01/2015 00:10:10'}, {id: 10002, date: '01/01/2015 00:11:10'}, {id: 10003, date: '01/01/2015 00:11:00'}]);
    assert.equal(cursorInfo.newest, Date.parse('01/01/2015 00:11:10'));
    assert.equal(cursorInfo.oldest, Date.parse('01/01/2015 00:10:10'));
  });

  it('should return idList based on idColumn value', function () {
    var idList = Collector.idList('id', [{id: 10001, date: '01/01/2015 00:10:10'}, {id: 10002, date: '01/01/2015 00:11:10'}, {id: 10003, date: '01/01/2015 00:11:00'}]);
    assert.equal(idList[0], 10001);
    assert.equal(idList[idList.length - 1], 10003);
  });
});