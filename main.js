// ------------------------------------  PARAMETERS ------------------------------- //

var width = 800;
var height = 700;
var numRings = 10; // the number of rings in the radar chart
var chart1_cx = width / 2;
var chart1_cy = height / 2;
var spokeLength = 300;
var duration_length = 650;
var delay_length = 250;
/* The color spectrum for chart1 */
var c1_colors = ["#66bd70","#65bc6f","#63bc6e","#62bb6e","#60ba6d","#5eb96c","#5db86b","#5bb86a","#5ab769","#58b668","#57b568","#56b467","#54b466","#53b365","#51b264","#50b164","#4eb063","#4daf62","#4caf61","#4aae61","#49ad60","#48ac5f","#46ab5e","#45aa5d","#44a95d","#42a85c","#41a75b","#40a75a","#3fa65a","#3ea559","#3ca458","#3ba357","#3aa257","#39a156","#38a055","#379f54","#369e54","#359d53","#349c52","#339b51","#329a50","#319950","#30984f","#2f974e","#2e964d","#2d954d","#2b944c","#2a934b","#29924a","#28914a","#279049","#268f48","#258f47","#248e47","#238d46","#228c45","#218b44","#208a43","#1f8943","#1e8842","#1d8741","#1c8640","#1b8540","#1a843f","#19833e","#18823d","#17813d","#16803c","#157f3b","#147e3a","#137d3a","#127c39","#117b38","#107a37","#107937","#0f7836","#0e7735","#0d7634","#0c7534","#0b7433","#0b7332","#0a7232","#097131","#087030","#086f2f","#076e2f","#066c2e","#066b2d","#056a2d","#05692c","#04682b","#04672b","#04662a","#03642a","#036329","#026228","#026128","#026027","#025e27","#015d26","#015c25","#015b25","#015a24","#015824","#015723","#005623","#005522","#005321","#005221","#005120","#005020","#004e1f","#004d1f","#004c1e","#004a1e","#00491d","#00481d","#00471c","#00451c","#00441b"]

/* There aren't enough colors in the spectrum for all the data, so this adds each color 17 times
consecutively to the colors array. This is the array used to color the data in the graph */
var colors = [];
for (var i = c1_colors.length-1; i >= 0; i--) {
  for (var j = 0; j < 17; j++) {
    colors.push(c1_colors[i]);
  }
}


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

  // get the genres of the music to use later?
  var genres = Array.from(d3.map(csv, function(d) {
    return d["Top Genre"];
  }).keys()
  );
  

  // ------------------------- FUN WITH FUNCTIONS ------------------------------- //
  
  // get angle of an attribute's associated axis
  get_angle = function(attr, index) {
		return (Math.PI / 2) + (2 * Math.PI * index / graphAttributes.length);
	}

	
	// Finding the extent of an attribute [min,max]
    get_extent = function(attr) {
        return d3.extent(csv, function(row) {
            return row[attr];
        })
    }
	
	// add to our dictionary of scales for later use
	get_scales = function() {
		for (var i = 0; i < graphAttributes.length; i++) {
			var attr = graphAttributes[i];
			graphScales[attr] = d3.scaleLinear().domain(get_extent(attr)).range([0, spokeLength]); 
		}
	}
	
	// Gets the coordinate on the x-y plane of a single attribute at a single value
    // returned as an object with attributes "x" and "y"
    get_coordinate = function(attr, value) {
    let angle = 0;
    axes.forEach(function(axis) {
      if (axis.key == attr) {
        angle = axis.value.angle;
      }
    })
		var x = Math.cos(angle) * graphScales[attr](value);
		var y = Math.sin(angle) * graphScales[attr](value);
		
		return [x, y];	
    }
  
    // gets the coordinates of the specified path returned in a 2d array, with 
    // the first element = x coordinate, second element = y coordinate for each point
    get_path_coordinates = function(data_point) {
		var coordinates = [];
		for (var i = 0; i < graphAttributes.length; i++) {
			var attr = graphAttributes[i];
			coordinates.push(get_coordinate(attr, data_point[attr]));
		}
		return coordinates;
	}
	
	// turn an observation (row) into a path d attribute
	get_path = function(data_point) {
		var coordinates = get_path_coordinates(data_point);
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
	
	// ------------------------- FUN WITH AXES ------------------------------- //
	// ... doesn't have quite the same ring
  
    // Avg is a data element containing the average value for each attribute
	var avg = [];

	for (var a = 0; a < graphAttributes.length; a++) {
		var sum = 0;
		for (var i = 0; i < csv.length; i++) {
		  sum += ting[i][graphAttributes[a]];
		}
		avg[graphAttributes[a]] = sum / ting.length;
	} 
  
    // save indices and angles of axes for fast access  
    var axesObjs = {};
	for (var i = 0; i < graphAttributes.length; i++) {
		var key = graphAttributes[i];
		var ang = get_angle(key, i);
		let line_coordinate = [Math.cos(ang) * spokeLength, Math.sin(ang) * spokeLength];
		axesObjs[key] = {
			angle: ang,
			coordinates: line_coordinate,
			index: i+1
		};
	};

	var axes = d3.entries(axesObjs);

	function setAxes(attributes) {
		for (var i = 0; i < axes.length; i++) {
			for (var j = 0; j < attributes.length; j++) {
				if (axes[i].key == attributes[j]) {
					var ang = get_angle(axes[i].key, j);
					let line_coordinate = [Math.cos(ang) * spokeLength, Math.sin(ang) * spokeLength];
					axes[i].value.coordinates = line_coordinate;
					axes[i].value.angle = ang;
					axes[i].value.index = j+1;
				}
			}
		}
	}
	
	
  // -------------------------- SVG SETUP ------------------------------- //

	
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

		// add axes
		radar.append("g")
			.selectAll(".line")
			.data(axes)
			.enter()
			.append("line")
			.attr('class', 'axis')
					.attr("x1", 0)
					.attr("y1", 0)
					.attr("x2", function(d) {
			  return d.value.coordinates[0];
			})
					.attr("y2", function(d) {
			  return d.value.coordinates[1];
			})
					.attr("stroke","black");
        
		// add axis labels
        radar.append("g")
        .selectAll(".labels")
        .data(axes)
        .enter()
        .append("text")
        .attr('class', 'labels')
				.attr("x", function(d) {
          return Math.cos(d.value.angle) * (spokeLength + 3);
        })
				.attr("y", function(d) {
          return Math.sin(d.value.angle) * (spokeLength + 3);
        })
				.style("text-anchor", function(d) {
          let label_x = Math.cos(d.value.angle) * (spokeLength + 3);
					if (label_x < 0) {
						return "end";
					}	
				}) 
				.style("font-size", 17)
				.text(function(d) {
          return d.key;
        });
	}
	
	// actually call this function
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
	// var line = d3.line()
		// .x(function(d) {
			// return d[0];
		// })
		// .y(function(d) {
			// return d[1];
		// });
		
	// Calculate scales
	get_scales();
	
	// Add paths for each row
	radar.append("g")
    .selectAll("path")
		.data(csv)
		.enter()
    .append("path")
      .attr('class', 'dataPath')
			.attr("d", function(d) {return get_path(d);})
      .attr("fill", function(d, i) { return colors[i]})
      .attr("opacity", 0.6);

    // Add the average path and color it blue
    radar.append("path")
      .attr('class', 'avgPath')
      .attr("d", function() {
        return get_path(avg);
      })
      .style('fill', '#0400ff')
      .style('opacity', '0.3');
  
	// create the tooltip
	var tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
      

    // Adds circles for all the points of the average graph on the axes
    radar.append('g')
      .selectAll('.avgPoint')
      .data(axes)
      .enter()
      .append('circle')
        .attr('class', 'avgPoint')
        .attr('cx', function(d) {
          return get_coordinate(d.key, avg[d.key])[0];
        })
        .attr('cy', function(d) {
          return get_coordinate(d.key, avg[d.key])[1];
        })
        .attr('r', 7)
        .style('fill', '#0400ff')
        .on("mouseover", function(d) {
          d3.select(this).attr('r', 10);
          d3.select('.tooltip').html("<p>" + d.key + "</p><p>Average: "
            + Math.round(avg[d.key])  + "</p>")
            .style("left", (d3.event.pageX + 5) + "px")
            .style("top", (d3.event.pageY - 28) + "px")
            .transition().duration(200).style("opacity", 0.75);
        })
        .on("mouseout", function(d) {
          d3.select(this).attr('r', 7);
          d3.select('.tooltip').transition().duration(200).style("opacity", 0);
        });
		
		
		// SHOW DISPLAY THINGS
		document.getElementById("numSongs").innerHTML = "Now displaying " + ting.length + " songs";
		document.getElementById("popSongs").innerHTML = "Popularity >= 0";
		
		var list = document.getElementById("topSongsList");
		
		// get currently displayed songs
		var current = ting.map(function(a) {
			var song = a.Artist + " - " + a.Title;
			var songLink = song.link("https://open.spotify.com/search/" + a.Artist + " " + a.Title);
			return songLink;
		});
		
		// post am
		for (var i = 0; i < current.length; i++) {
			var listElement = document.createElement("li");
			listElement.innerHTML = current[i];	
			list.appendChild(listElement);
		}


// ----------------------------------- REDRAW FUNCTION ------------------------------------ //
	
	
	// CHANGE THE AXES 
	redraw_axes = function() {
		
	    // 1. FIND SELECTED AXES
        let boxes = document.getElementsByTagName('input');
        let selected = [];
        for (var i = 0; i < boxes.length; i++) {
			if (boxes[i].checked) {
			    selected.push(boxes[i].value);
			}
        }
        graphAttributes = selected;
        setAxes(graphAttributes);
 
        // 2. MOVE SELECTED AXES
        radar.selectAll('line')
            .filter(function(d) {
				for (var i = 0; i < graphAttributes.length; i++) {
					if (d.key == graphAttributes[i]) {
						return true;
					}
				}		
				return false;
			})
			.transition()
			.duration(function(d) {
				return duration_length;
			})
			.delay(function(d) {
			    return delay_length;
			})
			.attr("x2", function(d) {
				return d.value.coordinates[0];
			})
			.attr("y2", function(d) {
				return d.value.coordinates[1];
			});

        // REMOVE THE NOT-SELECTED AXES
        radar.selectAll('line')
			.filter(function(d) {
				for (var i = 0; i < graphAttributes.length; i++) {
					if (d.key == graphAttributes[i]) {
						return false;
					}
				}
				return true;
			})
			.transition()
			.duration(function(d) {
				return duration_length;
			})
			.delay(function(d) {
			    return delay_length;
			})
			.attr("x2", 0)
			.attr("y2", 0);
        
        // MOVE THE SELECTED LABELS
        radar.selectAll('.labels')
			.filter(function(d) {
				for (var i = 0; i < graphAttributes.length; i++) {
					if (d.key == graphAttributes[i]) {
						return true;
					}
				}
				return false;
			})
			.transition()
			.duration(function(d) {
				return duration_length;
			})
			.delay(function(d) {
			    return delay_length;
			})
			.attr("x", function(d) {
				let label_coordinate = [Math.cos(d.value.angle) * (spokeLength + 3), Math.sin(d.value.angle) * (spokeLength + 3)];	
				return label_coordinate[0];
			})
			.attr("y", function(d) {
				let label_coordinate = [Math.cos(d.value.angle) * (spokeLength + 3), Math.sin(d.value.angle) * (spokeLength + 3)];	
				return label_coordinate[1];
			})
			.style("text-anchor", function(d) {
				let label_coordinate = [Math.cos(d.value.angle) * (spokeLength + 3), Math.sin(d.value.angle) * (spokeLength + 3)];	
				if (label_coordinate[0] < 0) {
					return "end";
				}	
			})
			.text(function(d) {
				return d.key;
			})
			.style('visibility', 'visible');

        // REMOVE THE NOT-SELECTED LABELS
        radar.selectAll('.labels')
			.filter(function(d) {
				for (var i = 0; i < graphAttributes.length; i++) {
					if (d.key == graphAttributes[i]) {
						return false;
					}
				}
				return true;
			})
			.transition()
			.duration(function(d) {
				return duration_length;
			})
			.delay(function(d) {
				return delay_length;
			})
			.style('visibility', 'hidden');
        

		// RECALCULATE SCALES
		get_scales();
		
		// REDRAW PATHS
        radar.selectAll('.dataPath')
			.transition()
			.duration(function(d) {
				return duration_length;
			})
			.delay(function(d) {
			   return delay_length;
			})
			.attr('d', function(d) {
			  return get_path(d);
			});

      // REDRAW AVERAGE PATH
      radar.select('.avgPath')
		  .transition()
			.duration(function(d) {
				return duration_length;
			})
			.delay(function(d) {
			   return delay_length;
			})
		  .attr("d", function() {return get_path(avg);}); 

      // REDRAW NEW POINTS ON AVERAGE PATH
      radar.selectAll('.avgPoint')
		  .filter(function(d) {
			for (var i = 0; i < graphAttributes.length; i++) {
			  if (d.key == graphAttributes[i]) {
				return true;
			  }
			}
			return false;
		  })
		  .transition()
			.duration(function(d) {
				return duration_length;
			})
			.delay(function(d) {
			   return delay_length;
			})
			.attr('cx', function(d) {
			  return get_coordinate(d.key, avg[d.key])[0];
			})
			.attr('cy', function(d) {
			  return get_coordinate(d.key, avg[d.key])[1];
			})
			.style('visibility', 'visible');

        // REMOVE THE POINTS FOR AXES NO LONGER ON THE CHART
        radar.selectAll('.avgPoint')
          .filter(function(d) {
            for (var i = 0; i < graphAttributes.length; i++) {
              if (d.key == graphAttributes[i]) {
                return false;
              }
            }
            return true;
          })
          .transition()
            .duration(function(d) {
                return duration_length;
            })
            .delay(function(d) {
              return delay_length;
            })
          .style('visibility', 'hidden');

    }
	
	redraw_axes();
	
	redraw_paths = function() {
		
		var threshold = document.getElementById("slider").value;
		
		// REMOVE UNPOPULAR SONGS
		d3.selectAll(".dataPath")
			.transition()
			.attr('transform', function(d) {
				if (d.Popularity < threshold) {
					return 'scale(0)';
				} else {
					return 'scale(1)';
				}
			});
			// .classed("hidden", function(d) {
				// return d.Popularity < threshold;
			// })
			
			
		// CHANGE AVERAGE PATH
		// Avg is a data element containing the average value for each attribute
		avg = [];

		for (var a = 0; a < graphAttributes.length; a++) {
			var sum = 0;
			var len = 0;
			for (var i = 0; i < ting.length; i++) {
				if (ting[i]["Popularity"] >= threshold) {
					sum += ting[i][graphAttributes[a]];
					len += 1;
				}
			}
			avg[graphAttributes[a]] = sum / len;
			
			document.getElementById("numSongs").innerHTML = "Now displaying " + len + " songs";
			document.getElementById("popSongs").innerHTML = "Popularity >= " + threshold;
		}
		
		// UPDATE LIST OF TOP SONGS
		
		var list = document.getElementById("topSongsList");
				
		// clear previous output
		while (list.firstChild) {
			list.removeChild(list.firstChild);
		}
		
		// get currently displayed songs
		var current = ting.filter(a => a.Popularity >= threshold).map(function(a) {
			var song = a.Artist + " - " + a.Title;
			var songLink = song.link("https://open.spotify.com/search/" + a.Artist + " " + a.Title);
			return songLink;
		});
		
		// post am
		for (var i = 0; i < current.length; i++) {
			var listElement = document.createElement("li");
			listElement.innerHTML = current[i];	
			list.appendChild(listElement);
		}
		
		
		redraw_axes();

	}


    // ----------------------------- SLIDER FUNCTIONS -------------------------

	// Add the Set Axes button to DOM and set its onClick function
	d3.select(filters)
		.append('p')
		.append('button')
		.style("border", "1px solid black")
		.style("font-family", "proxima-nova")
		.text('Set Axes')
		.on('click', redraw_axes)

	// Automatically update when changing the slider
    d3.select('#slider')
        .on('change', redraw_paths);



}); // end of main function

 
