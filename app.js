window.onload = function() {

	var milestones;

	cartodb.createVis('map', 'http://saleiva.cartodb.com/api/v2/viz/8215d42e-ed7e-11e3-aa57-0edbca4b5057/viz.json')
	.done(function(vis, layers) {

		var map = vis.getNativeMap();

		var seq = O.Sequential();
		O.Keys().left().then(seq.prev, seq);
	  	O.Keys().right().then(seq.next, seq);
	  	$('a.next').click(function() { seq.next(); })
	  	$('a.prev').click(function() { seq.prev(); })

		var story = O.Story();

		var updateUI = function(txt,date,marker) { 
        	return O.Action(function() {
                $('#milestone > p').text(txt)
                $('#milestone > span').text(date)
                $('#footer > #buttons > span').text(story.state()+1 + '/' + milestones.length)
                console.log(marker)
              }); 
        }

		var sql = new cartodb.SQL({ user: 'saleiva' });
		sql.execute("SELECT date, date_proc, location, state, zoom, txt, marker, st_y(the_geom) as lat, st_x(the_geom) as lon FROM maya_facts_locations ORDER BY date_proc ASC")
			.done(function(data) {

				milestones = data.rows;

				for (var i = 0; i < milestones.length; ++i) {
					var stop = data.rows[i];
					var pos = [stop.lat, stop.lon];
					var txt = stop.txt;
					var date = stop.date +', '+stop.location +', '+stop.state;
					var zoom = stop.zoom;
					var marker = L.icon({
						iconUrl: 'img/markers/'+stop.marker+'.png',
						iconSize: [49,59],
						iconAnchor: [24,56]
					});

					var action = O.Step(
						map.actions.panTo(pos),
						map.actions.setZoom(stop.zoom),
						L.marker(pos, {icon: marker})
							.actions.addRemove(map),
						updateUI(txt,date,stop.marker)
						// O.Location.changeHash('#'+i)
						)
					story.addState(seq.step(i), action)
				}
				// seq.current(+location.hash.slice(1))
				story.go(0);

			})
			.error(function(errors) {
				// errors contains a list of errors
				console.log("errors:" + errors);
			});

	});
}