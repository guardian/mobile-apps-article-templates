var express = require('express');
var proxy = require('express-http-proxy');
var app = express();
var zlib = require('zlib');
var parse = require('url').parse;

app.use(express.static(__dirname + '/fixture'));
app.use('/data/data/com.guardian/files/dev-templates/assets', express.static(__dirname + '/../ArticleTemplates/assets'));
app.use('/performances', express.static(__dirname + '/../Performance'));
app.use('/root', express.static(__dirname + '/..'));

// forward every /mapi to production mapi
app.use('/', proxy('http://mobile-apps.guardianapis.com', {
	intercept: function(data, req, res, callback){
		console.log(parse(req.url).path);
		if(data.length > 0 && !/ico/.test(parse(req.url).path)){
			zlib.gunzip(data, function (gunzipError, unzipbody) {
				var object = JSON.parse(unzipbody.toString().replace(new RegExp('http://mobile-apps.guardianapis.com','g'), 'http://localhost:3000'));
				

				// mocking adv
				if(object.cards){
					object.cards.forEach(function(card){
						card.item.sponsorship = {
							sponsorName: 'The Rockefeller Foundation',
							sponsorUri: 'http://www.100resilientcities.org',
							aboutUri: 'x-gu://item/mobile-apps.guardianapis.com/items/cities/2014/jan/27/cities-about-this-site',
							format: 'Guardian Cities is supported by: #{sponsor}',
							isAdvertising: false
						};
						if(card.item && card.item.metadata){
							card.item.metadata.witnessAssignmentId = "5536849ce4b0574bd49be6d1";
						}
					});
				}

				zlib.gzip(new Buffer(JSON.stringify(object)), function(gunzipError, zipbody){
					callback(null, zipbody);
				});				
			});
		} else {
			callback(null, data);
		}
	}
}));

module.exports = app;

// var server = app.listen(3000, function () {
//   var host = server.address().address
//   var port = server.address().port
//   console.log('Example app listening at http://%s:%s', host, port)
// })