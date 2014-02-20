	function audioBackground(duration) {
	
		numOfCircles = Math.floor((duration / 60)/10)+2;

		// numOfCircles = Math.floor(Math.abs(Math.tan(duration)*2));
		
		h = $("#header").height();
		w = $("#header").width();
		size = (h * w) / 8000;
		
		x = [];
		y = [];
		
		console.log(x);
		
		for (var i=0; i<numOfCircles; i++) {
			var attempt;
			value = (Math.floor((Math.random()*w)+1)/20);
			value = Math.floor(value) * 20;
			
			if ($.inArray(value, x) !== -1 && attempt < 3) {
				i = i -1;
				attempt++;
			} else {
				x.push(value);
				console.log(x);
				attempt = 0;
			}
		}
		
		for (var i=0; i<numOfCircles; i++) {
			var attempt;
			value = (Math.floor((Math.random()*h)+1)/20);
			value = Math.floor(value) * 20;
			
			if ($.inArray(value, y) !== -1 && attempt < 3) {
				i = i -1;
				attempt++;
			} else {
				y.push(value);
				attempt = 0;
			}


		}
		
		var ctx = $(document)[0].getCSSCanvasContext("2d", "squares", w, h);
		
		for (var i=0; i<numOfCircles; i++) {
			
			ctx.beginPath();
			ctx.arc(x[i], y[i], size, 0, Math.PI*2, true);
			ctx.closePath();
			ctx.fillStyle = "rgba(0,0,0,0.15)";
			ctx.fill();
			size = size * 1.3;
		}
	};
	
	function audioPlay() {
		$('.audio-button span').html('&#xe04d;'); 
	}	
	
	function audioStop() {
		$('.audio-button .icon').html("&#xe04b;"); 
	}
	
	var audioCurrent;
	var down;
	var slider1;
	var input1;
	
	document.addEventListener('touchstart', function(e) {
		down = 1;
	}, false);
	
	document.addEventListener('touchend', function(e) {
		 down = 0;
	}, false);

	function superAudioSlider(current, duration, platform) {
		
		if (platform == "iOS") {
			if (down == 1) return;	
		}
		
		$(".audio-knob").removeAttr("style");
		
		input1 = document.getElementById('audio-scrubber');
		slider1 = new MobileRangeSlider('audio-slider', {
		  value: current,
		  min: 0,
		  max: duration,
		  change: function(percentage) {
		  	audioCurrent = percentage;
		    input1.value = secondsTimeSpanToHMS(percentage);
		    $("#audio-scrubber-left").val("-" + secondsTimeSpanToHMS(duration - percentage));
		  }
		});
	
	}
	
	function updateSlider(current, platform) {
	
		if (platform == "iOS") {
			if (down == 1) return;	
		}
		
		slider1.setValue(current);
	
	}
	
	/* Caution: Hot Mess */
	
	MobileRangeSlider.prototype.end = function() {
		 this.removeEvents("move");
		 this.removeEvents("end");
		 var iframe = document.createElement("IFRAME");
		 iframe.setAttribute("src", "setPlayerTime:" + audioCurrent);
		 document.documentElement.appendChild(iframe);
		 iframe.parentNode.removeChild(iframe);
		 iframe = null;
	};
	
	function secondsTimeSpanToHMS(s) {
    	var m = Math.floor(s/60); //Get remaining minutes
    	s -= m*60;
    	return (m < 10 ? '0'+m : m)+":"+(s < 10 ? '0'+s : s); //zero padding on minutes and seconds
	}