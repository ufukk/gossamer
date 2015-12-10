var read = require('node-readability');
var S = require('string');

read('http://www.mediacatonline.com/ray-banden-bir-havana-macerasi/', function(err, article, meta) {

    if(err)
        console.log(err);

    console.log(article.title);

    console.log(S(article.content).stripTags());

});
