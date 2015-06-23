var Collector = require('./collector');
var removeDiacritics = require('diacritics').remove;
var https = require('https');
var parseString = require('xml2js').parseString;

var S = (function () {

  var urlPrefix = 'https://eksisozluk.com/';

  var EksiSozlukCollector = function (options) {
    options = options || {};
    if(!options.cursor)
      throw new Error('Missing cursor');

    this.cursor = options.cursor;

    EksiSozlukCollector.prototype.convertKeywordToUrl = function (keyword, params) {
      params = params || {};
      var direction = params.direction || null;
      var queryParams = {};
      if(params.page) {
        queryParams.p = direction == 'forward' ? params.page + 1 : params.page;
      }
      return urlPrefix + removeDiacritics(keyword.replace(' ', '-')) + Collector.queryString(queryParams);
    }

    EksiSozlukCollector.prototype.readSource = function(callback) {
      var listPattern = /<([\w]+)[ ]*id\="entry\-list">([.\s\S]*?)<\/\1>/gi;
      https.get(this.convertKeywordToUrl(this.cursor.keyword, this.cursor), function(response) {
        var output = '';
        response.on('data', function(chunk) {
          output += chunk;
        });

        response.on('end', function() {
          var content = listPattern.exec(output);
          parseString(content, function(err, xmlObject) {
            if(err)
              console.log(err);

            var pagingPattern = /<div[ a-zA-Z\="]+data-currentpage="(\d+)"[ a-zA-Z\="]+data-pagecount="(\d+)"[ a-zA-Z\="]*>/i;
            var pagingElement = output.match(pagingPattern);
            var result = [];
            var oldest = 0;
            var newest = 0;
            xmlObject.ul.li.forEach(function(item) {
              var contentDate = Date.parse(item.footer[0].div[1].a[0]['_'].replace(/#([^ ]*( *))/, ''));
              if(contentDate < oldest || oldest == 0)
                oldest = contentDate;

              if(contentDate > newest || newest == 0)
                newest = contentDate;
              result.push({id: item['$']['data-id'], author: item['$']['data-author'], body: item['div'][0]['_'], date: contentDate});
            });

            callback({contents: result, cursor: {currentPage: pagingElement[1], pageCount: pagingElement[2], newest: newest, oldest: oldest }});
          });
        });
      });
          
    }

  }
  return EksiSozlukCollector;
})();

module.exports = S;