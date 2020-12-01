var width = 800;
var height = 800;
var rangeMax = 600; 
var numRings = 10; // the number of rings in the radar chart
var chart1_cx = 400;
var chart1_cy = 400;


d3.csv("Spotify-2000.csv", function (csv) {
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


  // Finding the extent of each value [min,max]

  function get_extent(attr) {
    return d3.extent(csv, function(row) {
      return row[attr];
    })
  }



  var bpmExtent = d3.extent(csv, function(row) {
    return row.bpm;
  });

  var loudExtent = d3.extent(csv, function(row) {
    return row.Loudness;
  });


  var lengthExtent = d3.extent(csv, function(row) {
    return row.Length;
  });

 var danceExtent = d3.extent(csv, function(row) {
    return row.Danceability;
  });

  var energyExtent = d3.extent(csv, function(row) {
    return row.Energy;
  });

  var liveExtent = d3.extent(csv, function(row) {
    return row.Liveness;
  });

  var valenceExtent = d3.extent(csv, function(row) {
    return row.Valence;
  });

  var acousticExtent = d3.extent(csv, function(row) {
    return row.Acousticness;
  });

  var speechExtent = d3.extent(csv, function(row) {
    return row.Speechiness;
  });  

  // --------------------------- SCALE SETUP -----------------------------

  
  var domainMax = d3.max([bpmExtent[1], loudExtent[1], lengthExtent[1], danceExtent[1], 
    energyExtent[1], liveExtent[1], valenceExtent[1], acousticExtent[1], speechExtent[1]]);

  var radialScale = d3.scaleLinear()
    .domain([0, domainMax])
    .range([0,rangeMax]);



  // Scales for the different attribute axes
  function scale(attr) {
    if (attr == "radial") {
      return d3.scaleLinear().domain([0, domainMax]).range([0, rangeMax]);
    } 
      let extent = get_extent(attr);
      return d3.scaleLinear().domain(extent).range([0, rangeMax]);
  }

  // ----------------------------- AXES SETUP ----------------------------

  // Gets the coordinate on the x-y plane of the given value at a given angle
  // returned as an object with attributes "x" and "y"
  function getCoordinate(angle, value, attr) {
    // ???????????????????????????????????????????????????????????????????????????????????????
    // ERROR: I have no clue why the scale function isn't working for attr,
    // I think it has something to do with passing in the string as a variable, but
    // scale(attr)(value) is returning NaN 
    // ???????????????????????????????????????????????????????????????????????????????????????
    let x = Math.cos(angle) * scale(attr)(value);
    let y = Math.sin(angle) * scale(attr)(value);

    return [chart1_cx + x, chart1_cy - y];
  }

  var attributes = ["Beats Per Minute (BPM)", "Loudness (dB)", "Length (Duration)", "Danceability", "Energy", "Liveness", "Valence", "Acousticness", "Speechiness"];
  
  function drawAxes(labels, chart) {
    let lineWidth = (((domainMax / numRings) * 10) / 2) + 50;
    for (var i = 0; i < labels.length; i++) {
      let name = labels[i];
      let angle = (Math.PI / 2) + (2 * Math.PI * i / labels.length);
      let line_coordinate = getCoordinate(angle, lineWidth, "radial");
      let label_coordinate = getCoordinate(angle, (lineWidth + 1), "radial");

      //draw axis line
      chart.append("line")
      .attr("x1", chart1_cx)
      .attr("y1", chart1_cy)
      .attr("x2", line_coordinate[0])
      .attr("y2", line_coordinate[1])
      .attr("stroke","black");

      //draw axis label
      chart.append("text")
      .attr("x", label_coordinate[0])
      .attr("y", label_coordinate[1])
      .text(name);
    }
  }


  //Chreate svg for chart 1
  var chart1 = d3
    .select("#chart1")
    .append("svg:svg")
    .attr("width", width)
    .attr("height", height);


    // Draw rings for chart1
    for(var i=1; i <= numRings; i++) {
      chart1.append("circle")
      .attr("cx", chart1_cx)
      .attr("cy", chart1_cy)
      .attr("r", scale("radial")(((domainMax / numRings) * i)) / 2);
    }

  // Draw Axes on chart1
  drawAxes(attributes, chart1);

  // Plot data
  var line = d3.line()
    .x(function(d) {
      return d[0];
    })
    .y(function(d) {
      return d[1];
    });

  function getPathCoordinates(data_point){
    let coordinates = [];
    for (var i = 1; i < attributes.length; i++){
        var name = attributes[i];
        let angle = (Math.PI / 2) + (2 * Math.PI * i / attributes.length);
        coordinates.push(getCoordinate(angle, data_point[name], data_point.Title));
    }
    return coordinates;
    
}

  for (var i = 1; i < csv.length; i ++){
    let d = csv[i];
    let coordinates = getPathCoordinates(csv[i]);

    //draw the path element
    chart1.append("path")
    .datum(coordinates)
    .attr("d", line)
    .attr("stroke-width", 3)
    .attr("stroke", "green")
    .attr("fill", "green")
    .attr("stroke-opacity", 1)
    .attr("opacity", 0.2);
  }


});

 
