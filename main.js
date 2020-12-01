var width = 800;
var height = 700;
var numRings = 10; // the number of rings in the radar chart
var chart1_cx = width / 2;
var chart1_cy = height / 2;
var spokeLength = 300;


d3.csv("Spotify-2000.csv", function (csv) {
	
    // appropriate variable types
	for (var i = 0; i < csv.length; ++i) {
		csv[i].bpm = Number(csv[i]["Beats Per Minute (BPM)"]);
		csv[i].Loudness = 28 + Number(csv[i]["Loudness (dB)"]);
		csv[i].Length = Number(csv[i]["Length (Duration)"]);
		csv[i].Danceability = Number(csv[i].Danceability);
		csv[i].Energy = Number(csv[i].Energy);
		csv[i].Liveness = Number(csv[i].Liveness);
		csv[i].Valence = Number(csv[i].Valence);
		csv[i].Acousticness = Number(csv[i].Acousticness);
		csv[i].Speechiness = Number(csv[i].Speechiness);
		csv[i].Popularity = Number(csv[i].Popularity);
	}
	
	// make data globally available
	ting = csv;
	
	// attributes we'll use for axes
	graphAttributes = ["bpm", "Loudness", "Length", "Danceability", "Energy", "Liveness", "Valence", "Acousticness", "Speechiness"];
	
	
	// ------------------------- FUN WITH FUNCTIONS ------------------------------- //
	
	// Finding the extent of an attribute [min,max]
    get_extent = function(attr) {
        return d3.extent(csv, function(row) {
            return row[attr];
        })
    }
  
    // Create a linear scale for a given attribute
	get_scale = function(attr) {
		return d3.scaleLinear().domain(get_extent(attr)).range([0, spokeLength]);	
	}
	
	// At what angle are we positioning this attribute?
	get_angle = function(attr) {
		var i = graphAttributes.indexOf(attr);
		return (Math.PI / 2) + (2 * Math.PI * i / graphAttributes.length);
	}
	
	// Gets the coordinate on the x-y plane of a single attribute at a single value
    // returned as an object with attributes "x" and "y"
    get_coordinate = function(attr, value) {
		var x = Math.cos(get_angle(attr)) * get_scale(attr)(value);
		var y = Math.sin(get_angle(attr)) * get_scale(attr)(value);
		
		return [x, y];	
	}
	
	// turn an observation (row) into a path d attribute
	get_path = function(data_point) {
		var coordinates = [];
		for (var i = 1; i < graphAttributes.length; i++) {
			var attr = graphAttributes[i];
			var angle = get_angle(attr);
			coordinates.push(get_coordinate(attr, data_point[attr]));
		}

		var path = "";
		for (var i = 0; i < coordinates.length; i++) {
			if (i == 0) {
				path = path + "M "
			} else {
				path = path + "L "
			}
    
			path = path + coordinates[i][0] + " " + coordinates[i][1] + " "
			
			if (i + 1 == coordinates.length) {
				path = path + "L " + coordinates[0][0] + " " + coordinates[0][1]
			}
		}
		
		return path;
	}
	
	
	// -------------------------- SVG AND AXIS SETUP ------------------------------- //
	
	
	//Create svg for chart 1
	var chart1 = d3
		.select("#chart1")
		.append("svg:svg")
		.attr("width", width)
		.attr("height", height);
	
	// create group to hold everybody
	radar = chart1.append("g")
		.attr("transform", "translate(" + chart1_cx + ", " + chart1_cy + ")");
		
	
	// function to draw the axis them
	// labels: attributes for which to draw axis
	function drawAxes(labels) {
	
		for (var i = 0; i < labels.length; i++) {
			
			// get attribute name, coordinates
			let label = labels[i];
			let angle = get_angle(label);

			let line_coordinate = [Math.cos(angle) * spokeLength, Math.sin(angle) * spokeLength]
			let label_coordinate = [Math.cos(angle) * (spokeLength + 3), Math.sin(angle) * (spokeLength + 3)];	  

			//draw axis line
			radar.append("line")
				.attr("x1", 0)
				.attr("y1", 0)
				.attr("x2", line_coordinate[0])
				.attr("y2", line_coordinate[1])
				.attr("stroke","black");

			//write axis label
			radar.append("text")
				.attr("x", label_coordinate[0])
				.attr("y", label_coordinate[1])
				.style("text-anchor", function() {
					if (label_coordinate[0] < 0) {
						return "end";
					}	
				})
				// .style("dominant-baseline", function() {
					// if (label_coordinate[1] > 0) {
					    // return "hanging";	
					// }
				// })
				.text(label);
		}
	}
	
	drawAxes(graphAttributes);
	
	// Draw rings for chart1
    for (var i=1; i <= numRings; i++) {
		radar.append("circle")
			.attr("cx", 0)
			.attr("cy", 0)
			.attr("r", spokeLength / numRings * i);
    }
	


  // ----------------------------- DRAWING DATA ---------------------------- //
  

	
	// Make the data itself
	// I'm not sure...is this still being used?
	var line = d3.line()
		.x(function(d) {
			return d[0];
		})
		.y(function(d) {
			return d[1];
		});
	
	
	// Add paths for each row
	radar.append("g")
		.selectAll("path")
		.data(csv)
		.enter()
		.append("path")
			.attr("d", function(d) {return get_path(d);})
			.attr("fill", "none")
			.attr("stroke", "green")

  // function getPathCoordinates(data_point){
    // let coordinates = [];
    // for (var i = 1; i < attributes.length; i++){
        // var name = attributes[i];
        // let angle = (Math.PI / 2) + (2 * Math.PI * i / attributes.length);
        // coordinates.push(getCoordinate(angle, data_point[name], data_point.Title));
    // }
    // return coordinates;
    
// }

  // for (var i = 1; i < csv.length; i ++){
    // let d = csv[i];
    // let coordinates = getPathCoordinates(csv[i]);

    // //draw the path element
    // chart1.append("path")
    // .datum(coordinates)
    // .attr("d", line)
    // .attr("stroke-width", 3)
    // .attr("stroke", "green")
    // .attr("fill", "green")
    // .attr("stroke-opacity", 1)
    // .attr("opacity", 0.2);
  // }



}); // end of main function

 
