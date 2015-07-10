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
		if(data.length > 0 && !/ico|png/.test(parse(req.url).path)){
			zlib.gunzip(data, function (gunzipError, unzipbody) {
				var object = JSON.parse(unzipbody.toString().replace(new RegExp('http://mobile-apps.guardianapis.com','g'), 'http://localhost:3000'));

				// mocking adv
				if(object.cards){
					object.cards.forEach(function(card){
						console.log(card.item.id);
						if(card.item.id === "football/live/2015/jun/07/republic-of-ireland-england-international-friendly-live"){
							card.item.liveContent.liveBloggingNow = true;
							card.item.type = "footballLiveBlog";
							card.item.footballContent = {
								id: "3812437",
								status: "FT",
								phase: "after",
								kickOff: "2015-06-07T12:00:00Z",
								competitionDisplayName: "Friendlies",
								homeTeam: {
									id: "494",
									name: "Rep of Ireland",
									shortCode: "IRL",
									crestUri: "http://png-resizer.mobile-apps.guardianapis.com/sport/football/crests/494.png?width=#{width}",
									score: 0,
									followUp: {
										type: "list",
										uri: "http://mobile-apps.guardianapis.com/lists/tag/football/republicofireland"
									},
									topic: {
										displayName: "Rep of Ireland",
										topic: {
											type: "football-team",
											name: "494"
										}
									}
								},
								awayTeam: {
									id: "497",
									name: "England",
									shortCode: "ENG",
									crestUri: "http://png-resizer.mobile-apps.guardianapis.com/sport/football/crests/497.png?width=#{width}",
									score: 0,
									followUp: {
										type: "list",
										uri: "http://mobile-apps.guardianapis.com/lists/tag/football/england"
									},
									topic: {
										displayName: "England",
										topic: {
											type: "football-team",
											name: "497"
										}
									}
								},
								matchInfoUri: "http://football.mobile-apps.guardianapis.com/match-info/3812437",
								venue: "Aviva Stadium"
							}
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