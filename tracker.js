require('sugar');
var Repo = require('./repository');

var Tracker = {

    idForLocation: function (location) {
        return [location.source, location.type, String(location.id).replace(/http(s*):\/\//, '')].join('_');
    },

    toCursor: function (location) {
        if(!location.source || !location.type || !location.id)
            throw new Error('Incomplete location info');
        return Object.merge(location, {_id: Tracker.idForLocation(location), lastCollectedAt: 0, refreshRate: 0, priority: 1});
    },

    checkCursors: function (locations, callback) {
        var cursorIds = [];
        var map = {};
        locations.forEach(function(location) {
            location = location._id ? location._id : location.source ? Tracker.idForLocation(location) : location;
            cursorIds.push(location);
            map[location] = false;
        });

        Repo.cursorRepository.find({_id: {$in: cursorIds}}, function(err, result) {
            result.forEach(function(item) {
                map[item._id] = true;
            });

            callback(map);
        });
    },

    trackLocations: function(locations, callback) {
        Tracker.checkCursors(locations, function(map) {
            var list = locations.filter(function(item) {
                return map[Tracker.idForLocation(item)] == false;
            }).map(function(item) {
                return Tracker.toCursor(item);
            });
            Repo.cursorRepository.insert(list);
        });
    },

    directionForCursor: function(cursor) {
        return Math.ceil(Math.random() * 10) % 3 ? 'backward' : 'forward';
    },

    findCursorsToRead: function(options, callback) {
        if(!options.source)
            throw new Error('Cursor source is not specified');
        var limit = options.limit || 50;
        var filter = !options.type ? {source: options.source} : !options.id ? {source: options.source, type: options.type} : {source: options.source, type: options.type, id: options.id};
        Repo.cursorRepository.find({filter: filter, sort: {priority: 1}, limit: limit}, function(err, result) {
            callback(result.map(function(item) {
                item.direction = Tracker.directionForCursor(item);
                return item;
            }));
        });
    },

    updateCursors: function(cursors, callback) {
        var idList = cursors.map(function(item) {
            return item._id ? item._id : Tracker.idForLocation(item);
        });
        Repo.cursorRepository.find({_id: {$in: idList}}, function(err, result) {
            var data = [];
            var map = {};
            result.forEach(function(item) {
                map[item._id] = item;
            });

            cursors.forEach(function(item) {
                var _id = Tracker.idForLocation(item);
                data.push(_id in map ? Object.merge(map[_id], item) : Tracker.toCursor(item));
            });

            Repo.cursorRepository.insertOrUpdate(data, function(err, result) {
                callback(result);
            });
        });
    }
}

module.exports = Tracker;