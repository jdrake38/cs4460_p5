var width = 800;
var height = 800;
var rangeMax = 600; 
var numRings = 10; // the number of rings in the radar chart
var chart1_cx = 400;
var chart1_cy = 400;


d3.csv("Spotify-2000.csv", function (csv) {
  console.log(csv);
  for (var i = 0; i < csv.length; ++i) {
    csv[i].Danceability = Number(csv[i].Danceability);
    csv[i].Energy = Number(csv[i].Energy);
    csv[i].Liveness = Number(csv[i].Liveness);
    csv[i].Valence = Number(csv[i].Valence);
    csv[i].Acousticness = Number(csv[i].Acousticness);
    csv[i].Speechiness = Number(csv[i].Speechiness);
    csv[i].Popularity = Number(csv[i].Popularity);
  }


  // Finding the extent of each value [min,max]
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

  // Radial scale for circles
  var domainMin = d3.min([danceExtent[0], energyExtent[0], liveExtent[0], valenceExtent[0],
    acousticExtent[0], speechExtent[0]]);
  
  var domainMax = d3.min([danceExtent[1], energyExtent[1], liveExtent[1], valenceExtent[1],
    acousticExtent[1], speechExtent[1]]);

    console.log("Domain min: " + domainMax);

  var radialScale = d3.scaleLinear()
    .domain([domainMin, domainMax])
    .range([0,rangeMax]);


  // Scales for the different attribute axes
  var danceScale = d3.scaleLinear().domain(danceExtent).range([0,rangeMax]);
  var energyScale = d3.scaleLinear().domain(energyExtent).range([0,rangeMax]);
  var liveScale = d3.scaleLinear().domain(liveExtent).range([0,rangeMax]);
  var valenceScale = d3.scaleLinear().domain(valenceExtent).range([0,rangeMax]);
  var acousticScale = d3.scaleLinear().domain(acousticExtent).range([0,rangeMax]);
  var speechScale = d3.scaleLinear().domain(speechExtent).range([0,rangeMax]);

  // ----------------------------- AXES SETUP ----------------------------

  // Gets the coordinate on the x-y plane of the given value at a given angle
  // returned as an object with attributes "x" and "y"
  function getCoordinate(angle, value) {
    let x = Math.cos(angle) * radialScale(value);
    let y = Math.sin(angle) * radialScale(value);
    return {"x": chart1_cx + x, "y": chart1_cy - y};
  }

  var attributes = ["Danceability", "Energy", "Liveness", "Valence", "Acousticness", "Speechiness"];
  function drawAxes(labels, chart) {
    let lineWidth = (numRings * 2) + 3;
    for (var i = 0; i < labels.length; i++) {
      let name = labels[i];
      let angle = (Math.PI / 2) + (2 * Math.PI * i / labels.length);
      let line_coordinate = getCoordinate(angle, lineWidth);
      let label_coordinate = getCoordinate(angle, lineWidth + 1);

      //draw axis line
      chart.append("line")
      .attr("x1", chart1_cx)
      .attr("y1", chart1_cy)
      .attr("x2", line_coordinate.x)
      .attr("y2", line_coordinate.y)
      .attr("stroke","black");

      //draw axis label
      chart.append("text")
      .attr("x", label_coordinate.x)
      .attr("y", label_coordinate.y)
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
      .attr("r", radialScale(i*2));
    }

  // Draw Axes on chart1
  drawAxes(attributes, chart1);

});

 
