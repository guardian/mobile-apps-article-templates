var express = require('express');
var proxy = require('express-http-proxy');
var app = express();

app.use(express.static(__dirname + '/fixture'));
app.use('/data/data/com.guardian/files/dev-templates/assets', express.static(__dirname + '/../ArticleTemplates/assets'));
app.use('/performances', express.static(__dirname + '/../Performance'));
app.use('/root', express.static(__dirname + '/..'));

// forward every /mapi to production mapi
app.use('/', proxy('http://mobile-apps.guardianapis.com', {
	intercept: function(data){
       data = JSON.parse(data.toString('utf8'));
       console.log(data);
       callback(null, JSON.stringify(data));
	}
}));

//module.exports = app;


var server = app.listen(3000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)

})