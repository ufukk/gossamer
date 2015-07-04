var https = require('https');
var parseString = require('xml2js').parseString;

var S = (function() {

  var EksiSozlukKeywordCollector = function(options) {
    options = options || {};
    if(!options.cursor)
      throw new Error('Missing cursor');

    this.cursor = options.cursor;

    EksiSozlukKeywordCollector.prototype.convertSearchTermToUrl = function(searchTerm, page) {
      page = page || 1;
      return 'https://eksisozluk.com/basliklar/ara?searchForm.Keywords=' + encodeURIComponent(searchTerm) + '&searchForm.Author=&searchForm.When.From=&searchForm.When.To=&searchForm.NiceOnly=false&searchForm.SortOrder=Date&p=' + page
    }

    EksiSozlukKeywordCollector.prototype.readSource = function(callback) {
      var listPattern = /<ul class="topic-list"[^>]*>([.\s\S]*?)<\/ul>/gi;
      https.get(this.convertSearchTermToUrl(this.cursor.id, this.cursor.page), function(response) {
        var output = '';
        response.on('data', function(chunk) {
          output += chunk;
        });

        response.on('end', function() {
          var pagingPattern = /<div[^>]*data-currentpage="(\d+)"[^>]*data-pagecount="(\d+)"[^>]*>/i;
          var pagingElement = output.match(pagingPattern);
          var cursor = pagingElement ? {currentPage: pagingElement[1], pageCount: pagingElement[2]} : {};

          var listContent = listPattern.exec(output);
          parseString(listContent, function(err, xmlObject) {
            if(err)
              console.log(err);

            var contents = [];
            xmlObject.ul.li.forEach(function(item) {
              contents.push({id: item.a[0]._});
            });

            callback({contents: contents, cursor: cursor});
          });

        });
      });
    }

  }

  return EksiSozlukKeywordCollector;
})();

module.exports = S;