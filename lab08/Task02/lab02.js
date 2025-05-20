function init() {
        // Setup the SVG canvas
        var width = 800;
        var height = 500;

        // Setup the SVG canvas dimensions
        var svg = d3.select("#chart")
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        // Setup projection
        var projection = d3.geoMercator()
            .center([145, -36.5])
            .translate([width / 2, height / 2])
            .scale(3500);

        var path = d3.geoPath()
            .projection(projection);

        // Setup color scale (go with blue)
        var colour = d3.scaleQuantize()
            .range(["#eff3ff", "#bdd7e7", "#6baed6", "#3182bd", "#08519c"]);

        // Using Promise.all to load multiple files
        Promise.all([
            d3.json("LGA_VIC.json"),
            d3.csv("VIC_LGA_unemployment.csv")
        ]).then(([geoData, csvData]) => {
            var dataMap = {};
            csvData.forEach(d => {
                dataMap[d.LGA.trim().toLowerCase()] = +d.unemployed;
            });

            geoData.features.forEach(feature => {
                var lgaName = feature.properties.LGA_name.trim().toLowerCase();
                feature.properties.unemployed = dataMap[lgaName] || 0;
            });

            colour.domain([0, d3.max(geoData.features, d => d.properties.unemployed)]);

            // Ensure the map is appended first
            svg.selectAll("path")
                .data(geoData.features)
                .enter()
                .append("path")
                .attr("d", path)
                .style("fill", d => d.properties.unemployed > 0 ? colour(d.properties.unemployed) : "#ccc")
                .attr("stroke", "#000")
                .attr("stroke-width", 0.5);

            // Debugging: Log the cities data to verify it is loaded correctly
            d3.csv("VIC_city.csv").then(cities => {
                console.log("Cities Data:", cities);

                // Append circles for towns and cities
                svg.selectAll("circle")
                    .data(cities)
                    .enter()
                    .append("circle")
                    .attr("cx", d => projection([+d.lon, +d.lat])[0])
                    .attr("cy", d => projection([+d.lon, +d.lat])[1])
                    .attr("r", 3)
                    .style("fill", "red")
                    .style("opacity", 0.7)
                    .append("title")
                    .text(d => d.place);

                // Append text labels for city names separately
                svg.selectAll(".city-label")
                    .data(cities)
                    .enter()
                    .append("text")
                    .attr("class", "city-label")
                    .attr("x", d => projection([+d.lon, +d.lat])[0] + 5) // Offset slightly to the right
                    .attr("y", d => projection([+d.lon, +d.lat])[1] - 5) // Offset slightly above
                    .text(d => d.place)
                    .style("font-size", "10px")
                    .style("fill", "black");
            }).catch(error => {
                console.error("Error loading city data:", error);
            });

            // Add legend
            var legend = svg.append("g")
                .attr("class", "legend")
                .attr("transform", `translate(${width - 150}, 20)`);

            var legendScale = d3.scaleLinear()
                .domain(colour.domain())
                .range([0, 100]);

            var legendAxis = d3.axisRight(legendScale)
                .ticks(5)
                .tickFormat(d3.format(".0f"));

            legend.selectAll("rect")
                .data(colour.range().map((d, i) => {
                    return {
                        color: d,
                        value: legendScale.invertExtent ? legendScale.invertExtent(d)[0] : i
                    };
                }))
                .enter()
                .append("rect")
                .attr("x", 0)
                .attr("y", (d, i) => i * 20)
                .attr("width", 20)
                .attr("height", 20)
                .style("fill", d => d.color);

            legend.append("g")
                .attr("transform", "translate(25, 0)")
                .call(legendAxis);
        }).catch(error => {
            console.error("Error loading data:", error);
        });
}

window.onload = init;