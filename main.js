var width = 500;
var height = 500;

d3.csv("Spotify-2000.csv", function (csv) {
  for (var i = 0; i < csv.length; ++i) {
    
  }

  // COMPLETE THESE FUNCTIONS TO SEE THE SCATTERPLOTS +++++++++++++++


  // Axis setup


  //Create SVGs for charts
  var chart1 = d3
    .select("#chart1")
    .append("svg:svg")
    .attr("width", width)
    .attr("height", height);
