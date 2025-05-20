function init () {
    var w = 500;
    var h = 150;
    var wombatSightings;

    var svg = d3.select("#chart")
                .append("svg")
                .attr("width", w)
                .attr("height", h);

    d3.csv("test.csv").then(function(data) {
        console.log(data);
        wombatSightings = data;

        barChart(wombatSightings);
    });

    function barChart(wombatSightings) {

        svg.selectAll("rect")
        .data (wombatSightings)
        .enter()
        .append ("rect")
        .attr("x", function(d, i)   {
            return i * (w/wombatSightings.length);
        })
        .attr("y", function(d)  {
            return h - (d.wombats * 4);
        })
        .attr("width", w/wombatSightings.length - 2)
        .attr("height", function(d) {
            return (d.wombats * 4);
        })
        .attr("fill", function(d)   {
            // We will use a traffic light approach
            if (d.wombats >= 25)    {
                return "red";
            }
            else if (d.wombats < 25 && d.wombats > 10)  {
                return "orange";
            }
            else    {
                return "green";
            }
        });
    }
    
    }
    window.onload = init;
    
    