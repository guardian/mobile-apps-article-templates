casper.start('http://localhost:3000/tone_news.html')
.then(function() {
  phantomcss.screenshot('#tone_news', 'Loaded');
});