function init() {

    var width = 800;
    var height = 500;

    var projection = d3.geoMercator()
                   .center([145, -36.5])
                   .translate([width / 2, height / 2])
                   .scale(3500);

    var path = d3.geoPath()
         .projection(projection);

    var svg = d3.select("#chart")
                .append("svg")
                .attr("width", width)
                .attr("height", height);

    d3.json("LGA_VIC.json").then(function(json) {
       svg.selectAll("path")
          .data(json.features)
          .enter()
          .append("path")
          .attr("d", path)
          .attr("fill", "gray")
          .attr("stroke", "black")
          .attr("stroke-width", 0.5);
    });
}

window.onload = init;
