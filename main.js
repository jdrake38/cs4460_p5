var width = 800;
var height = 700;
var numRings = 10; // the number of rings in the radar chart
var chart1_cx = width / 2;
var chart1_cy = height / 2;
var spokeLength = 300;
var c1_colors = ["#66bd70","#65bc6f","#63bc6e","#62bb6e","#60ba6d","#5eb96c","#5db86b","#5bb86a","#5ab769","#58b668","#57b568","#56b467","#54b466","#53b365","#51b264","#50b164","#4eb063","#4daf62","#4caf61","#4aae61","#49ad60","#48ac5f","#46ab5e","#45aa5d","#44a95d","#42a85c","#41a75b","#40a75a","#3fa65a","#3ea559","#3ca458","#3ba357","#3aa257","#39a156","#38a055","#379f54","#369e54","#359d53","#349c52","#339b51","#329a50","#319950","#30984f","#2f974e","#2e964d","#2d954d","#2b944c","#2a934b","#29924a","#28914a","#279049","#268f48","#258f47","#248e47","#238d46","#228c45","#218b44","#208a43","#1f8943","#1e8842","#1d8741","#1c8640","#1b8540","#1a843f","#19833e","#18823d","#17813d","#16803c","#157f3b","#147e3a","#137d3a","#127c39","#117b38","#107a37","#107937","#0f7836","#0e7735","#0d7634","#0c7534","#0b7433","#0b7332","#0a7232","#097131","#087030","#086f2f","#076e2f","#066c2e","#066b2d","#056a2d","#05692c","#04682b","#04672b","#04662a","#03642a","#036329","#026228","#026128","#026027","#025e27","#015d26","#015c25","#015b25","#015a24","#015824","#015723","#005623","#005522","#005321","#005221","#005120","#005020","#004e1f","#004d1f","#004c1e","#004a1e","#00491d","#00481d","#00471c","#00451c","#00441b"]
//console.log("NUM COLORS: " + c1_colors.length);

var colors = [];
for (var i = c1_colors.length-1; i >= 0; i--) {
  for (var j = 0; j < 17; j++) {
    colors.push(c1_colors[i]);
  }
}

console.log("COLORS LENGTH: " + colors.length);

d3.csv("Spotify-2000.csv", function (csv) {
	
    // appropriate variable types
	for (var i = 0; i < csv.length; ++i) {
		csv[i].bpm = Number(csv[i]["Beats Per Minute (BPM)"]);
		csv[i].Loudness = 28 + Number(csv[i]["Loudness (dB)"]);
		csv[i].Length = Number(csv[i]["Length (Duration)"].replace(',', ''));
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
	// scales we'll use for axes (to be created)
	graphScales = {};
  
  console.log("NUM DATA: " + csv.length);

  // get the genres
  var genres = Array.from(d3.map(csv, function(d) {
    return d["Top Genre"];
  }).keys()
  );

  // The average data object of all the attributes
 /* var avg = {
    bpm: 0,
    Loudness: 0,
    Length: 0,
    Danceability: 0,
    Energy: 0,
    Liveness: 0,
    Valence: 0,
    Acousticness: 0,
    Speechiness: 0
  } */

  var avg = new Object();

  for (var a = 0; a < graphAttributes.length; a++) {
    var sum = 0;
    for (var i = 0; i < csv.length; i++) {
      sum += ting[i][graphAttributes[a]];
    }
    avg[graphAttributes[a]] = sum / ting.length;
  } 

 // console.log(avg);

	
	// ------------------------- FUN WITH FUNCTIONS ------------------------------- //
	
	// Finding the extent of an attribute [min,max]
    get_extent = function(attr) {
        return d3.extent(csv, function(row) {
            return row[attr];
        })
    }
  
    // // Create a linear scale for a given attribute
	// get_scale = function(attr) {
		// return d3.scaleLinear().domain(get_extent(attr)).range([0, spokeLength]);	
	// }
	
	// add to our dictionary of scales for later use
	get_scales = function() {
		for (var i = 0; i < graphAttributes.length; i++) {
			var attr = graphAttributes[i];
			graphScales[attr] = d3.scaleLinear().domain(get_extent(attr)).range([0, spokeLength]); 
		}
	}
	
	// At what angle are we positioning this attribute?
	get_angle = function(attr) {
		var i = graphAttributes.indexOf(attr);
		return (Math.PI / 2) + (2 * Math.PI * i / graphAttributes.length);
	}
	
	// Gets the coordinate on the x-y plane of a single attribute at a single value
    // returned as an object with attributes "x" and "y"
    get_coordinate = function(attr, value) {
		var x = Math.cos(get_angle(attr)) * graphScales[attr](value);
		var y = Math.sin(get_angle(attr)) * graphScales[attr](value);
		
		return [x, y];	
	}
	
	// turn an observation (row) into a path d attribute
	get_path = function(data_point) {
		var coordinates = [];
		for (var i = 0; i < graphAttributes.length; i++) {
			var attr = graphAttributes[i];
      var angle = get_angle(attr);
      //console.log("attr: " + attr);
      //console.log("data_point[attr]: " + data_point[attr]);
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
  
  var axes = chart1.append("g");
    
		
	
	// function to draw the axis them
	// labels: attributes for which to draw axis
	function drawAxes(labels) {

    radar.append("g")
        .selectAll(".line")
        .data(graphAttributes)
        .enter()
        .append("line")
        .attr('class', 'axis')
				.attr("x1", 0)
				.attr("y1", 0)
				.attr("x2", function(d) {
          let angle = get_angle(d);
          let line_coordinate = [Math.cos(angle) * spokeLength, Math.sin(angle) * spokeLength]
          return line_coordinate[0];
        })
				.attr("y2", function(d) {
          let angle = get_angle(d);
          let line_coordinate = [Math.cos(angle) * spokeLength, Math.sin(angle) * spokeLength]
          return line_coordinate[1];
        })
				.attr("stroke","black");

        radar.append("g")
        .selectAll(".labels")
        .data(graphAttributes)
        .enter()
        .append("text")
        .attr('class', 'labels')
				.attr("x", function(d) {
          let angle = get_angle(d);
          return Math.cos(angle) * (spokeLength + 3);
        })
				.attr("y", function(d) {
          let angle = get_angle(d);
          return Math.sin(angle) * (spokeLength + 3);
        })
				.style("text-anchor", function(d) {
          let angle = get_angle(d);
          let label_x = Math.cos(angle) * (spokeLength + 3);
					if (label_x < 0) {
						return "end";
					}	
				})
				// .style("dominant-baseline", function() {
					// if (label_coordinate[1] > 0) {
					    // return "hanging";	
					// }
				// })
				.text(function(d) {
          return d;
        });

	
	/*	for (var i = 0; i < labels.length; i++) {
			
			// get attribute name, coordinates
			let label = labels[i];
			let angle = get_angle(label);

			let line_coordinate = [Math.cos(angle) * spokeLength, Math.sin(angle) * spokeLength]
			let label_coordinate = [Math.cos(angle) * (spokeLength + 3), Math.sin(angle) * (spokeLength + 3)];	  

			//draw axis line
      radar.append("line")
        .selectAll(".line")
        .data(graphAttributes)
        .enter()
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
		} */
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
		
	// Calculate scales
	get_scales();
	
	
	// Add paths for each row
	radar.append("g")
    .selectAll("path")
    .attr('class', 'dataPath')
		.data(csv)
		.enter()
		.append("path")
			.attr("d", function(d) {return get_path(d);})
      .attr("fill", function(d, i) { return colors[i]})
      //.attr("fill", "green")
      .attr("opacity", 0.4);

    radar.append("path")
      .attr('class', 'avgPath')
      .attr("d", function() {
        console.log(avg);
        return get_path(avg);
      })
      .style('stroke', 'darkgreen')
      .style('fill', 'none');
      

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

// ----------------------------------- BUTTON LOGIC ------------------------------------

d3.select(filters)
    .append('p')
    .append('button')
    .style("border", "1px solid black")
    .text('Set Axes')
    .on('click', function() {
      let boxes = document.getElementsByTagName('input');
      let selected = [];
      for (var i = 0; i < boxes.length; i++) {
        if (boxes[i].checked) {
          selected.push(boxes[i].value);
        }
      }
      graphAttributes = selected;
     // console.log(selected);

      // MOVE SELECTED AXES
      radar.selectAll('line')
        .filter(function(d) {
          for (var i = 0; i < graphAttributes.length; i++) {
            if (d == graphAttributes[i]) {
              return true;
            }
          }
          return false;
        })
        .transition()
        .duration(function(d) {
            return 800;
        })
        .delay(function(d) {
           return 800;
        })
        .attr("x2", function(d) {
          let angle = get_angle(d);
          let line_coordinate = [Math.cos(angle) * spokeLength, Math.sin(angle) * spokeLength]
          return line_coordinate[0];
        })
				.attr("y2", function(d) {
          let angle = get_angle(d);
          let line_coordinate = [Math.cos(angle) * spokeLength, Math.sin(angle) * spokeLength]
          return line_coordinate[1];
        });

        // REMOVE NOT SELECTED AXES
        radar.selectAll('line')
        .filter(function(d) {
          for (var i = 0; i < graphAttributes.length; i++) {
            if (d == graphAttributes[i]) {
              return false;
            }
          }
          return true;
        })
        .transition()
        .duration(function(d) {
            return 800;
        })
        .delay(function(d) {
           return 800;
        })
        .attr("x2", 0)
        .attr("y2", 0);
        
        // MOVE SELECTED LABELS
        radar.selectAll('.labels')
        .filter(function(d) {
          for (var i = 0; i < graphAttributes.length; i++) {
            if (d == graphAttributes[i]) {
              return true;
            }
          }
          return false;
        })
        .transition()
        .duration(function(d) {
            return 800;
        })
        .delay(function(d) {
           return 800;
        })
        .attr("x", function(d) {
          let angle = get_angle(d);
          let label_coordinate = [Math.cos(angle) * (spokeLength + 3), Math.sin(angle) * (spokeLength + 3)];	
          return label_coordinate[0];
        })
				.attr("y", function(d) {
          let angle = get_angle(d);
          let label_coordinate = [Math.cos(angle) * (spokeLength + 3), Math.sin(angle) * (spokeLength + 3)];	
          return label_coordinate[1];
        })
				.style("text-anchor", function(d) {
          let angle = get_angle(d);
          let label_coordinate = [Math.cos(angle) * (spokeLength + 3), Math.sin(angle) * (spokeLength + 3)];	
					if (label_coordinate[0] < 0) {
						return "end";
					}	
				})
				// .style("dominant-baseline", function() {
					// if (label_coordinate[1] > 0) {
					    // return "hanging";	
					// }
				// })
				.text(function(d) {
          return d;
        })
        .style('visibility', 'visible');

        // REMOVE NOT SELECTED LABELS
        radar.selectAll('.labels')
        .filter(function(d) {
          for (var i = 0; i < graphAttributes.length; i++) {
            if (d == graphAttributes[i]) {
              return false;
            }
          }
          return true;
        })
        .transition()
        .duration(function(d) {
            return 800;
        })
        .delay(function(d) {
           return 800;
        })
        .style('visibility', 'hidden');

		// RECALCULATE
		get_scales();
		
		// REDRAW
        radar.selectAll('.dataPath')
        .transition()
        .duration(function(d) {
            return 800;
        })
        .delay(function(d) {
           return 800;
        })
        .attr('d', function(d) {
          return get_path(d);
        });

      // draw average path
      radar.select('.avgPath')
      .transition()
        .duration(function(d) {
            return 800;
        })
        .delay(function(d) {
           return 800;
        })
      .attr("d", function() {return get_path(avg);}); 

    })

    // ----------------------------- SLIDER FUNCTIONS -------------------------
    function popFilter() {
      let value = d3.select("#slider").value;
      //console.log(value);
    }

    d3.select("#slider")
      .attr('onchange', function() {
      });


}); // end of main function

 
