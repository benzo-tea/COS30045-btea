function init() {
    var w = 600;
    var h = 300;
    var padding = 20;

    // Load the CSV file
    d3.csv("Unemployment_78-95.csv", function(d) {
        return {
            date: new Date(+d.year, +d.month - 1),
            number: +d.number
        };
    }).then(function(dataset) {
        // Define scales
        var xScale = d3.scaleTime()
            .domain([
                d3.min(dataset, function(d) { return d.date; }),
                d3.max(dataset, function(d) { return d.date; })
            ])
            .range([padding, w - padding]);

        var yScale = d3.scaleLinear()
            .domain([0, d3.max(dataset, function(d) { return d.number; })])
            .range([h - padding, padding]);

        // Define line generator
        var line = d3.line()
            .x(function(d) { return xScale(d.date); })
            .y(function(d) { return yScale(d.number); });

        // Define area generator
        var area = d3.area()
            .x(function(d) { return xScale(d.date); })
            .y0(function() { return yScale.range()[0]; })
            .y1(function(d) { return yScale(d.number); });

        // Create the SVG container
        var svg = d3.select("#chart")
            .append("svg")
            .attr("width", w)
            .attr("height", h);

        // Append the line path
        svg.append("path")
            .datum(dataset)
            .attr("class", "line")
            .attr("d", line)
            .attr("stroke", "steelblue")
            .attr("fill", "none");

        // Append a horizontal line at 500,000
        var halfMilValue = 500000;
        if (d3.max(dataset, d => d.number) >= halfMilValue) {
            svg.append("line")
                .attr("class", "line halfMilMark")
                .attr("x1", padding)
                .attr("y1", yScale(halfMilValue))
                .attr("x2", w - padding)
                .attr("y2", yScale(halfMilValue))
                .attr("stroke", "red")
                .attr("stroke-width", 1);

            svg.append("text")
                .attr("class", "halfMilMark")
                .attr("x", padding + 10)
                .attr("y", yScale(halfMilValue) - 10)
                .text("500,000 Unemployed");
        }

        // Log the dataset for debugging
        console.table(dataset, ["date", "number"]);
    }).catch(function(error) {
        console.error("Error loading the CSV file:", error);
    });
}

window.onload = init;