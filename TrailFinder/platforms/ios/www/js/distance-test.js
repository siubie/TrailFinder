var map;

function initialize() {
	var mapOptions = {
		zoom: 9,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	}
	map = new google.maps.Map(document.getElementById('map'), mapOptions);
	// Try HTML5 geolocation
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
			var lat = position.coords.latitude,
				lng = position.coords.longitude,
				//lat=41.081445,lng= -81.519005,
				pos = new google.maps.LatLng(lat, lng),
				//query from FusionTables for the map
				map_query = {
					select: 'Location',
					from: '1MsmdOvWLKNNrtKnmoEf2djCc3Rp_gYmueN4FGnc',
					limit: 3,
					orderBy: 'ST_DISTANCE(Coordinates, LATLNG(' + lat + ',' + lng + '))'
				},
				ftLayer = new google.maps.FusionTablesLayer({
					map: map,
					query: map_query
				}),
				geolocMarker = new google.maps.Marker({
					map: map,
					position: pos,
					clickable: true,
					icon: 'http://labs.google.com/ridefinder/images/mm_20_green.png'
				});
			geolocMarker.info = new google.maps.InfoWindow({
				content: '<span style="font-weight: bold;" class="users-location-marker">Your location</span>'
			});
			google.maps.event.addListener(geolocMarker, 'click', function() {
				geolocMarker.info.open(map, geolocMarker);
			});
			map.setCenter(pos);
			//query for the table
			var listQuery = "SELECT Name, Coordinates FROM " + '1MsmdOvWLKNNrtKnmoEf2djCc3Rp_gYmueN4FGnc' + ' ORDER BY ST_DISTANCE(Coordinates, LATLNG(' + lat + ',' + lng + '))' + ' LIMIT 3';
			var encodedQuery = encodeURIComponent(listQuery);
			// Construct the URL
			var url = ['https://www.googleapis.com/fusiontables/v1/query'];
			url.push('?sql=' + encodedQuery);
			url.push('&key=AIzaSyAJ_2Gtxlr4jeFuBup_jyRa5taZGk20JLs');
			url.push('&callback=?');
			// Send the JSONP request using jQuery
			$.ajax({
				url: url.join(''),
				dataType: 'jsonp',
				success: function(data) {
					var rows = data['rows'];
					var ftData = document.getElementById('sidebar-data');
					for (var i in rows) {
						var name = rows[i][0];
						var sidebarCoordinates = rows[i][1];
						var dataElement = document.createElement('tr');
						var nameElement = document.createElement('td');
						nameElement.innerHTML = name;
						nameElement.className = 'name-name';
						var coordinatesElement = document.createElement('td');
						coordinatesElement.innerHTML = sidebarCoordinates;
						coordinatesElement.className = 'coordinates';
						dataElement.appendChild(nameElement);
						dataElement.appendChild(coordinatesElement);
						ftData.appendChild(dataElement);

						var origins = pos,
						    destinations = sidebarCoordinates,
						    service = new google.maps.DistanceMatrixService();
						
						service.getDistanceMatrix(
						    {
						        origins: [origins],
						        destinations: [destinations],
						        travelMode: google.maps.TravelMode.DRIVING,
						        avoidHighways: false,
						        avoidTolls: false
						    }, 
						    callback
						);
						
						
						
						function callback(response, status) {
						  if (status == google.maps.DistanceMatrixStatus.OK) {
						    var origins = response.originAddresses;
						    var destinations = response.destinationAddresses;
						    var outputDiv = document.getElementById('outputDiv');
						    outputDiv.innerHTML = '';
						
						    for (var i = 0; i < origins.length; i++) {
						      var results = response.rows[i].elements;
						      for (var j = 0; j < results.length; j++) {
						        var element = results[j];
						        var distance = element.distance.text;
						        var duration = element.duration.text;
						        var from = origins[i];
						        var to = destinations[j];
						        outputDiv.innerHTML += origins[i] + ' to ' + destinations[j]
					            + ': ' + results[j].distance.text + ' in '
					            + results[j].duration.text + '<br>';
						      }
						    }
						  }
						}
						
						
						
						
						
						
						/*
						function callback(response, status) {
						    var orig = document.getElementById("orig"),
						        dest = document.getElementById("dest"),
						        dist = document.getElementById("dist");
						
						    if(status=="OK") {
						        //orig.value = response.destinationAddresses[0];
						        //dest.value = response.originAddresses[0];
						        //dist.value = response.rows[0].elements[0].distance.text;						        

						        $("#theresult").text(response.rows[0].elements[0].distance.text + " and " + response.rows[0].elements[0].duration.text);
						    } else {
						        alert("Error: " + status);
						    }*/

				}
			}
			});
		}, function() {
			handleNoGeolocation(true);
		});
} else {
	// Browser doesn't support Geolocation
	handleNoGeolocation(false);
}
}
//error handling for geolocation

function handleNoGeolocation(errorFlag) {
	if (errorFlag) {
		var content = 'Error: The Geolocation service failed.';
	} else {
		var content = 'Error: Your browser doesn\'t support geolocation.';
	}
	var options = {
		map: map,
		position: new google.maps.LatLng(41.081445, -81.519005),
		content: content
	};
	var infowindow = new google.maps.InfoWindow(options);
	map.setCenter(options.position);
}
google.maps.event.addDomListener(window, 'load', initialize);