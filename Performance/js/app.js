
google.setOnLoadCallback(drawSession.bind(this, window.location.hash.substring(1)));

function drawSession(session){
	$.get( "sessions/" + window.location.hash.substring(1) + ".csv", function( data ) {

		var tableRaw = Papa.parse(data, {dynamicTyping: true}).data.slice(0,-1);
		var table = [];
		$.each(tableRaw, function(i, rowRaw){
			var row = [];
			$.each(rowRaw, function(k, item){
				if(k===0 && i!== 0){
					row.push(i);	
				} else {
					row.push(item === "" ? -1 : item);	
				}
			});
			table.push(row.slice(0,-1));
		});

		var table = google.visualization.arrayToDataTable(table);
		var chart = new google.visualization.LineChart(document.getElementById('session_chart'));

        chart.draw(table, {
          title: 'Session: ' + session,
          legend: { position: 'bottom' },
          height: 600
        });
	});
}
