define([
	'bootstraps/cricket',
	'bonzo',
	'bean',
	'modules/$'
], function(Cricket, bonzo, bean, $){

	describe('Cricket', function(){
		var sandbox;

		before(function(){
			sandbox = bonzo(bonzo.create('<div id="sandbox" style="width: 700px; visibility: hidden;"></div>'));
			sandbox.appendTo(document.body);
		});

		it('exists', function(){
			expect(Cricket).to.be.defined;
		});

		if (navigator.userAgent.indexOf('PhantomJS') < 0) {
			it('handles the carousel', function(){
				var cricketHeader = bonzo(bonzo.create('<div class="cricket-match-summary-scorecard" id="cricket-match-summary-scorecard"><div class="cricket-scorecard-title"><b>Scorecard</b> - England 1st Innings</div><div class="cricket-scorecard-batsmen-wrap" id="cricket-scorecard-batsmen-wrap"><div class="cricket-scorecard-batsmen-sheet" id="cricket-scorecard-batsmen-sheet"><div class="cricket-scorecard-batsmen cricket-scorecard-batsmen-in-play"><p class="cricket-scorecard-batsmen-name">Cook &#8212; 13</p><p class="cricket-scorecard-batsmen-status">in play</p></div><div class="cricket-scorecard-batsmen cricket-scorecard-batsmen-in-play"><p class="cricket-scorecard-batsmen-name">Trott &#8212; 13</p><p class="cricket-scorecard-batsmen-status">in play</p></div><div class="cricket-scorecard-batsmen cricket-scorecard-batsmen-in-play"><p class="cricket-scorecard-batsmen-name">Trott &#8212; 13</p><p class="cricket-scorecard-batsmen-status">in play</p></div><div class="cricket-scorecard-batsmen"><p class="cricket-scorecard-batsmen-name">Trott &#8212; 13</p><p class="cricket-scorecard-batsmen-status">in play</p></div><div class="cricket-scorecard-batsmen"><p class="cricket-scorecard-batsmen-name">Trott &#8212; 13</p><p class="cricket-scorecard-batsmen-status">in play</p></div><div class="cricket-scorecard-batsmen"><p class="cricket-scorecard-batsmen-name">Trott &#8212; 13</p><p class="cricket-scorecard-batsmen-status">in play</p></div><div class="cricket-scorecard-batsmen"><p class="cricket-scorecard-batsmen-name">Trott &#8212; 13</p><p class="cricket-scorecard-batsmen-status">in play</p></div><div class="cricket-scorecard-batsmen cricket-scorecard-batsmen-duck"><p class="cricket-scorecard-batsmen-name">Trott &#8212; 13</p><p class="cricket-scorecard-batsmen-status">in play</p></div></div></div></div>'));
				cricketHeader.appendTo(sandbox);
				Cricket.modules.paginate();
				var card = document.getElementById('cricket-match-summary-scorecard');
				expect(card.getAttribute('data-pages')).to.be.equal('2');
			});
		}

		it('updates the card and the scorecard', function(){
			Cricket.init();
			var updateEndPoints = bonzo(bonzo.create('<div class="cricket" id="cricket"><div id="cricket-header">header1</div><div class="cricket-stats__wrap" id="cricket-scorecard">header2</div></div>'));
			updateEndPoints.appendTo(sandbox);
			expect(document.getElementById("cricket-header").textContent).to.be.equal("header1");
			expect(document.getElementById("cricket-scorecard").textContent).to.be.equal("header2");
			window.newCricketData("header3","header4");
			expect(document.getElementById("cricket-header").textContent).to.be.equal("header3");
			expect(document.getElementById("cricket-scorecard").textContent).to.be.equal("header4");
		});
		//reword
		it('on change of status updates a status class', function() {
			Cricket.init();
			var updateEndPoints = bonzo(bonzo.create('<div class="cricket" id="cricket"><div id="cricket-header">header1</div><div class="cricket-stats__wrap" id="cricket-scorecard">header2</div></div>'));
			updateEndPoints.appendTo(sandbox);
			window.newCricketStatus("pre-match");
			expect(document.getElementById("cricket").classList.contains('cricket--pre-match')).to.be.true;
		})

		it('removes card, scorecard and tab on cricketMatchInfoFailed', function(){
			Cricket.init();
			var updateEndPoints = bonzo(bonzo.create('<div class="cricket" id="cricket"><div id="cricket-header">header1</div><div class="cricket-stats__wrap" id="cricket-scorecard">header2</div></div>'));
			updateEndPoints.appendTo(sandbox);
			window.cricketMatchInfoFailed();
			expect(document.getElementById("cricket-header")).to.be.null;
			expect(document.getElementById("cricket-scorecard")).to.be.null;
		});

		afterEach(function(){
			sandbox.empty();
		});

		after(function(){
			sandbox.remove();
		});

	});

});
