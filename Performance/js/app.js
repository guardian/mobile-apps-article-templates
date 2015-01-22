
google.setOnLoadCallback(drawSession.bind(this, window.location.hash.substring(1)));

function drawSession(session){
	$.get( "sessions/" + window.location.hash.substring(1) + ".csv", function( data ) {

		var tableRaw = Papa.parse(data, {dynamicTyping: true}).data.slice(0,-1);
		var table = [];
		var averages = {};
		var initials = {};

		$.each(tableRaw, function(i, rowRaw){
			var row = [];
			var label = rowRaw.pop() || 'no-label';
			$.each(rowRaw, function(k, item){
				if(label && i!== 0){
					averages[label] = averages[label] || [0];
				}

				if(k===0 && i!== 0){
					row.push(i);
					if(label){
						initials[label] = i;
						averages[label][k] =  averages[label][k] + 1;
					}
				} else {
					row.push(item === "" ? -1 : item);
					if(label && i!== 0){
						if(!averages[label][k]){
							averages[label][k] = item;
						} else {
							averages[label][k] = averages[label][k] + ( parseFloat(item) - averages[label][k] ) / averages[label][0];
						}
					}
				}
			});
			table.push(row);
		});

		$.each(table, function(i, row){
			if(i!==0){
				$('.table-res').append('<tr><td>' + row.join('</td><td>') + '</td></tr>');
			}
		});

		$.each(Object.keys(averages), function(i, key){
			$('.table-avg').append('<tr><td>' + [key].concat(averages[key]).join('</td><td>') + '</td></tr>');
		});

		var table = google.visualization.arrayToDataTable(table);
		var chart = new google.visualization.LineChart(document.getElementById('session_chart'));

        chart.draw(table, {
          title: 'Session: ' + session,
          legend: { position: 'bottom' },
          height: 600,
          hAxis: {
			gridlines: {
          		count: tableRaw.length - 1
          	}
          },
          vAxis: {
          	minorGridlines: {
          		count: 5
          	},
          	viewWindow: {
          		min: 0
          	}
          }
        });
	});
}
