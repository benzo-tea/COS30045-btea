function init () {

    var w=800;
    var h=300;
    var padding=50;
    var dataset = [ [5, 20],
                    [500, 90],
                    [250, 50],
                    [100, 33],
                    [330, 95],
                    [410, 12],
                    [475, 44],
                    [25, 67],
                    [85, 21],
                    [220, 88]];

    var xScale = d3.scaleLinear() 
                .domain([d3.min(dataset, function(d) {
                    return d[0] - 5;
                }),
                d3.max (dataset, function(d) {
                return d[0];
                })
                ])
                .range ([padding, w - padding]);
    
    var xAxis = d3.axisBottom(xScale)
                .ticks(5)
                .scale(xScale);

    var yScale = d3.scaleLinear() 
                .domain([d3.min(dataset, function(d) {
                    return d[1] - 5;
                }),
                d3.max (dataset, function(d) {
                return d[1];
                })
                ])
                .range ([h - padding, padding]);

    var yAxis = d3.axisLeft()
                .ticks(5)
                .scale(yScale);

    var svg = d3.select("#chart")
                .append ("svg")
                .attr("width", w)
                .attr("height", h);

                svg.selectAll("circle")
                .data (dataset)
                .enter()
                .append("circle")
                .attr("cx", function(d, i) {
                return xScale(d[0]);
                })
                .attr("cy", function(d) {
                return yScale(d[1]);
                })
                .attr("r", 5)
                .attr("fill", function(d)   {
                    if (d[0] >= 480)    {
                        return "red";
                    }
                    else    {
                        return "slategrey";
                    }
                });

                svg.selectAll("text")
                .data(dataset)
                .enter()
                .append("text")
                .text(function(d) {
                    return d[0] + ", " + d[1];
                })
                .attr("x", function(d, i)  {
                    return xScale(d[0]);
                })
                .attr("y", function(d) {
                    return yScale(d[1] + 3);
                })
                .attr("fill", function(d)   {
                    return "green";
                })

                svg.append("g")
                .attr("transform", "translate(0, " + (h - padding) + ")")
                .call(xAxis);

                svg.append("g")
                .attr("transform", "translate(" + padding + ", 0) ")
                .call(yAxis);

    }
    window.onload = init;