var express = require('express');
var app = express();

app.use(express.static(__dirname + '/fixture'));
app.use('/data/data/com.guardian/files/dev-templates/assets', express.static(__dirname + '/../ArticleTemplates/assets'));
app.use('/performances', express.static(__dirname + '/../Performance'));
app.use('/root', express.static(__dirname + '/..'));

module.exports = app;