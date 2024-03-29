var Collector = require('./collector');
var removeDiacritics = require('diacritics').remove;
var https = require('https');
var parseString = require('xml2js').parseString;
var request = require('request');

var S = (function () {

  var urlPrefix = 'https://eksisozluk.com';

  var EksiSozlukCollector = function (options) {
    var self = this;
    options = options || {};
    if(!options.cursor)
      throw new Error('Missing cursor');

    this.cursor = options.cursor;

    EksiSozlukCollector.prototype.findUrl = function (callback) {
      var direction = this.cursor.direction || null;
      var queryParams = {};
      if(this.cursor.currentPage && this.cursor.pageCount && this.cursor.pageCount > 1) {
        queryParams.p = direction == 'forward' ? 1 : parseInt(this.cursor.currentPage) + 1;
      }
      if(direction == 'forward' || this.cursor.href) {
        callback(urlPrefix + this.cursor.href + Collector.queryString(queryParams));
        return;
      }

      request({url: urlPrefix + '/' + encodeURIComponent(this.cursor.locationId), followRedirect: false}, function(err, response) {
          self.cursor.href = response.headers.location;
          callback(urlPrefix + self.cursor.href + Collector.queryString(queryParams));
      });
    }

    EksiSozlukCollector.prototype.dateFromString = function(dateString) {
      if(dateString.indexOf('~') > 0)
        dateString = dateString.substring(0, dateString.indexOf('~'));
      var parts1 = dateString.split(' ');
      var parts2 = parts1[0].split('.');
      return Date.parse(parts2[2] + '-' + parts2[1] + "-" + parts2[0] + ' ' + parts1[1]);
    }

    EksiSozlukCollector.prototype.readSource = function(callback) {
      var self = this;
      var listPattern = /<([\w]+)[ ]*id\="entry\-list">([.\s\S]*?)<\/\1>/gi;
      this.findUrl(function(url) {
        request.get(url, function(err, response, output) {
        var content = listPattern.exec(output);
          if(content == null) {
              callback.call({parent: self}, {contents: null, cursor:self.cursor}, 'keyword error: ' + url);
              return;
          }
          parseString(content, function(err, xmlObject) {
            if(err)
              console.log(err);

            var pagingPattern = /<div[ a-zA-Z\="]+data-currentpage="(\d+)"[ a-zA-Z\="]+data-pagecount="(\d+)"[ a-zA-Z\="]*>/i;
            var pagingElement = output.match(pagingPattern);
            var result = [];
            var oldest = 0;
            var newest = 0;
            xmlObject.ul.li.forEach(function(item) {
              var contentDate = self.dateFromString(item.footer[0].div[1].a[0]['_'].replace(/#([^ ]*( *))/, ''));
              if(contentDate < oldest || oldest == 0)
                oldest = contentDate;

              if(contentDate > newest || newest == 0)
                newest = contentDate;
              result.push({id: item['$']['data-id'], author: {name: item['$']['data-author']}, body: item['div'][0]['_'], contentDate: contentDate});
            });
            if(pagingElement == null) {
              pagingElement = [0, 1, 1];
            }

            Collector.normalizeContents(result, {dateColumn: 'contentDate', orderIdColumn: 'id'});
            result = Collector.filterContentsByDate(result, self.cursor.direction, self.cursor);
            callback.call({parent: self}, {contents: result, cursor: {currentPage: pagingElement[1], pageCount: pagingElement[2], newest: newest, oldest: oldest }});
          });
      });

      });

    }

  }
  return EksiSozlukCollector;
})();

module.exports = S;
