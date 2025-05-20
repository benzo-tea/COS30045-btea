// SVG setup
const svg = d3.select("svg"),
      margin = {top: 80, right: 30, bottom: 150, left: 160},
      width = +svg.attr("width") - margin.left - margin.right,
      height = +svg.attr("height") - margin.top - margin.bottom,
      g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

// Scales for grouped bar and dot plots
const x0 = d3.scaleBand().rangeRound([0, width]).paddingInner(0.1);
const x1 = d3.scaleBand().padding(0.05);
const y = d3.scaleLinear().rangeRound([height, 0]);

// Education levels for legend and grouped charts
const educationLevels = [
  "Pre-primary, primary and lower secondary education",
  "Upper secondary and post-secondary non-tertiary, all programmes",
  "Tertiary education"
];

// Color scale for education levels
const color = d3.scaleOrdinal()
  .domain(educationLevels)
  .range(["#4E79A7", "#F28E2B", "#59A14F"]);

// Tooltip div
const tooltip = d3.select("body").append("div").attr("class", "tooltip");

// Chart titles
const chartTitle1 = svg.append("text")
  .attr("x", +svg.attr("width") / 2)
  .attr("y", 30)
  .attr("text-anchor", "middle")
  .style("font-size", "20px")
  .style("font-weight", "bold");

const chartTitle2 = svg.append("text")
  .attr("x", +svg.attr("width") / 2)
  .attr("y", 55)
  .attr("text-anchor", "middle")
  .style("font-size", "18px")
  .style("fill", "#666");

// "No Data" placeholder text
const noDataText = g.append("text")
  .attr("x", width / 2)
  .attr("y", height / 2)
  .attr("text-anchor", "middle")
  .style("font-size", "18px")
  .style("fill", "#999")
  .style("display", "none")
  .text("No data available for selected filters");

// Dark mode toggle button
const darkModeToggle = document.createElement('button');
darkModeToggle.textContent = 'Toggle Dark Mode';
Object.assign(darkModeToggle.style, {
  margin: '5px',
  padding: '8px 12px',
  fontSize: '14px',
  cursor: 'pointer',
  border: 'none',
  borderRadius: '4px',
  backgroundColor: '#333',
  color: '#fff'
});
document.querySelector('.controls').appendChild(darkModeToggle);

// Dark mode logic
let darkMode = false;
darkModeToggle.addEventListener('click', () => {
  darkMode = !darkMode;
  document.body.style.backgroundColor = darkMode ? '#121212' : '#fff';
  document.body.style.color = darkMode ? '#eee' : '#000';
  chartTitle1.style("fill", darkMode ? "#eee" : "#000");
  chartTitle2.style("fill", darkMode ? "#ccc" : "#666");
  darkModeToggle.style.backgroundColor = darkMode ? '#eee' : '#333';
  darkModeToggle.style.color = darkMode ? '#000' : '#fff';
  tooltip.style("background-color", darkMode ? "#222" : "#fff")
         .style("color", darkMode ? "#eee" : "#000");
  g.selectAll("text").style("fill", darkMode ? "#eee" : "#000");
  g.selectAll(".lowest-annotation").style("fill", darkMode ? "#eee" : "red");
  g.selectAll(".lowest-box").attr("fill", darkMode ? "#222" : "#fff").attr("stroke", darkMode ? "#aaa" : "#999");
});

// Load data
d3.csv("PHSwithContinent.csv").then(function(data) {
  const allData = data;

  // Populate continent and education dropdowns
  const continents = Array.from(new Set(data.map(d => d.CONTINENT))).sort();
  continents.forEach(continent => {
    d3.select("#continentSelect")
      .append("option")
      .attr("value", continent)
      .text(continent);
  });

  educationLevels.forEach(level => {
    d3.select("#incomeSelect")
      .append("option")
      .attr("value", level)
      .text(level);
  });

  // Setup static legend (initial)
  const legend = d3.select("#legend");
  color.domain().forEach(d => {
    const item = legend.append("div").attr("class", "legend-item");
    item.append("div")
      .attr("class", "legend-color")
      .style("background-color", color(d));
    item.append("span").text(d);
  });

  // Update the chart
  function updateChart() {
    const selectedContinent = d3.select("#continentSelect").property("value");
    const selectedSex = d3.select("#sexSelect").property("value");
    const selectedEdu = d3.select("#incomeSelect").property("value");
    const selectedChart = d3.select("#chartTypeSelect").property("value");

    updateLegend(selectedChart);

    // Update chart titles
    let title1 = "Self-Reported Health";
    let title2 = "";
    if (selectedContinent !== "All") title2 += `${selectedContinent}`;
    if (selectedSex !== "All") title2 += (title2 ? ", " : "") + selectedSex;
    if (selectedEdu !== "All") title2 += (title2 ? ", " : "") + selectedEdu;
    chartTitle1.text(title1);
    chartTitle2.text(title2);

    // Filter data based on selections
    let filteredData = allData.filter(d =>
      (selectedContinent === "All" || d.CONTINENT === selectedContinent) &&
      (selectedSex === "All" || d.Sex === selectedSex) &&
      (selectedEdu === "All" || d["Socio-economic status"] === selectedEdu)
    ).filter(d =>
      educationLevels.includes(d["Socio-economic status"]) &&
      !isNaN(parseFloat(d.OBS_VALUE))
    );

    // Clear and redraw
    g.selectAll("*").remove();
    if (filteredData.length === 0) {
      noDataText.style("display", null);
      return;
    } else {
      noDataText.style("display", "none");
    }

    if (selectedChart === "grouped") {
      drawGrouped(filteredData);
    } else if (selectedChart === "dot") {
      drawDotPlot(filteredData);
    } else if (selectedChart === "heatmap") {
      drawHeatmap(filteredData);
    }
  }

  updateChart();
  d3.select("#loading").classed("hidden", true);

  // Attach event listeners
  d3.selectAll("select").on("change", updateChart);
  d3.select("#resetButton").on("click", function() {
    d3.select("#continentSelect").property("value", "All");
    d3.select("#sexSelect").property("value", "All");
    d3.select("#incomeSelect").property("value", "All");
    d3.select("#chartTypeSelect").property("value", "grouped");
    updateChart();
  });

  d3.select("#downloadButton").on("click", function() {
    const c = d3.select("#continentSelect").property("value");
    const s = d3.select("#sexSelect").property("value");
    const e = d3.select("#incomeSelect").property("value");
    const chartType = d3.select("#chartTypeSelect").property("value"); //Get selected chart type
  
    const parts = [
      "education_health",
      chartType,                      //Add chart type into the filename
      c !== "All" ? c : null,
      s !== "All" ? s : null,
      e !== "All" ? e.replace(/[^a-zA-Z0-9]+/g, "_").toLowerCase() : null
    ].filter(Boolean);
  
    const filename = parts.join("_") + ".png";
  
    saveSvgAsPng(document.getElementById("chart"), filename, {
      scale: 2,
      backgroundColor: darkMode ? "#121212" : "#ffffff"
    });
  });
});
// Update legend depending on chart type
function updateLegend(chartType) {
  const legend = d3.select("#legend");
  legend.html(""); // Clear existing

  if (chartType === "heatmap") {
    const wrapper = legend.append("div")
      .style("display", "flex")
      .style("flex-direction", "column")
      .style("align-items", "center")
      .style("margin-top", "10px");

    wrapper.append("div")
      .style("width", "300px")
      .style("height", "20px")
      .style("background", "linear-gradient(to right, #edf8b1, #2c7fb8)")
      .style("margin-bottom", "5px");
    wrapper.append("div")
      .style("width", "300px")
      .style("display", "flex")
      .style("justify-content", "space-between")
      .style("font-size", "12px")
      .html('<span>0%</span><span>50%</span><span>100%</span>');

  } else {
    educationLevels.forEach(level => {
      const item = legend.append("div").attr("class", "legend-item");
      item.append("div")
        .attr("class", "legend-color")
        .style("background-color", color(level));
      item.append("span").text(level);
    });
  }
}

function drawGrouped(data) {
  // Setup x0, x1, and y domains
  const countries = Array.from(new Set(data.map(d => d["Reference area"])));
  x0.domain(countries);
  x1.domain(educationLevels).rangeRound([0, x0.bandwidth()]);
  y.domain([0, 100]);

  // Group data by country
  const groupedData = data.reduce((acc, d) => {
    const found = acc.find(v => v.Country === d["Reference area"]);
    const value = parseFloat(d.OBS_VALUE);
    const entry = { ...d, value };
    if (found) found.values.push(entry);
    else acc.push({ Country: d["Reference area"], values: [entry] });
    return acc;
  }, []);

  // Draw grouped bars
  const countryGroups = g.append("g")
    .selectAll("g")
    .data(groupedData)
    .join("g")
    .attr("transform", d => `translate(${x0(d.Country)},0)`)
    .attr("class", "country-group");

  countryGroups.selectAll("rect")
    .data(d => d.values)
    .join("rect")
    .attr("x", d => x1(d["Socio-economic status"]))
    .attr("width", x1.bandwidth())
    .attr("fill", d => color(d["Socio-economic status"]))
    .attr("y", height)
    .attr("height", 0)
    .on("mouseover", function(event, d) {
      // Show tooltip
      tooltip.html(`<strong>${d["Reference area"]}</strong><br/>${d["Socio-economic status"]}<br/><strong>${d.OBS_VALUE}%</strong>`)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 40) + "px")
        .transition().duration(300)
        .style("opacity", 1)
        .style("transform", "translateY(-10px)");
    })
    .on("mouseout", function() {
      // Hide tooltip
      tooltip.transition().duration(500)
        .style("opacity", 0)
        .style("transform", "translateY(0px)");
    })
    .transition()
    .duration(800)
    .ease(d3.easeCubicOut)
    .attr("y", d => y(d.value))
    .attr("height", d => height - y(d.value));

  // Add X axis
  g.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x0))
    .selectAll("text")
    .attr("transform", "rotate(45)")
    .style("text-anchor", "start");

  // Add Y axis
  g.append("g")
    .call(d3.axisLeft(y).ticks(10));

  // Annotate lowest bar
  if (groupedData.length > 0) {
    const flat = groupedData.flatMap(g => g.values);
    const lowest = flat.reduce((min, d) => d.value < min.value ? d : min, flat[0]);

    const barX = x0(lowest["Reference area"]) + x1(lowest["Socio-economic status"]) + x1.bandwidth() / 2;
    const barY = y(lowest.value);

    const labelText = `Lowest: ${lowest["Reference area"]}`;

    // Measure text width
    const tempText = g.append("text")
      .attr("x", -9999)
      .attr("y", -9999)
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .text(labelText);

    const textWidth = tempText.node().getBBox().width;
    tempText.remove();

    // Draw annotation background box
    g.append("rect")
      .attr("class", "lowest-box")
      .attr("x", barX - textWidth / 2 - 6)
      .attr("y", barY - 28)
      .attr("width", textWidth + 12)
      .attr("height", 20)
      .attr("rx", 4)
      .attr("fill", darkMode ? "#222" : "#fff")
      .attr("stroke", darkMode ? "#aaa" : "#999")
      .attr("stroke-width", 0.5)
      .attr("opacity", 0.9);

    // Draw annotation text
    g.append("text")
      .attr("class", "lowest-annotation")
      .attr("x", barX)
      .attr("y", barY - 14)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("fill", darkMode ? "#eee" : "red")
      .text(labelText);
  }
}

function drawDotPlot(data) {
  // Setup x and y scales
  const x = d3.scaleLinear()
    .domain([0, 100])
    .range([0, width]);

  const y = d3.scaleBand()
    .domain([...new Set(data.map(d => d["Reference area"]))])
    .range([0, height])
    .padding(0.3);

  // Group data by country
  const groupedData = data.reduce((acc, d) => {
    const found = acc.find(v => v.Country === d["Reference area"]);
    const value = parseFloat(d.OBS_VALUE);
    const entry = { ...d, value };
    if (found) found.values.push(entry);
    else acc.push({ Country: d["Reference area"], values: [entry] });
    return acc;
  }, []);

  // Draw dot points
  const countryGroups = g.append("g")
    .selectAll("g")
    .data(groupedData)
    .join("g")
    .attr("transform", d => `translate(0,${y(d.Country)})`)
    .attr("class", "country-group");

  countryGroups.selectAll("circle")
    .data(d => d.values)
    .join("circle")
    .attr("cy", d => 0)
    .attr("cx", 0)
    .attr("r", 0)
    .attr("fill", d => color(d["Socio-economic status"]))
    .on("mouseover", function(event, d) {
      // Show tooltip
      tooltip.html(`<strong>${d["Reference area"]}</strong><br/>${d["Socio-economic status"]}<br/><strong>${d.OBS_VALUE}%</strong>`)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 40) + "px")
        .transition().duration(300)
        .style("opacity", 1)
        .style("transform", "translateY(-10px)");
    })
    .on("mouseout", function() {
      // Hide tooltip
      tooltip.transition().duration(500)
        .style("opacity", 0)
        .style("transform", "translateY(0px)");
    })
    .transition()
    .duration(800)
    .ease(d3.easeCubicOut)
    .attr("cx", d => x(d.value))
    .attr("r", 6);

  // Add axes
  g.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(10));

  g.append("g")
    .call(d3.axisLeft(y));

  // Add x-axis label
  g.append("text")
    .attr("x", width / 2)
    .attr("y", height + 50)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("fill", darkMode ? "#fff" : "#000")
    .text("Percentage Reporting Good Health (%)");

  // Annotate lowest dot
  if (groupedData.length > 0) {
    const flat = groupedData.flatMap(g => g.values);
    const lowest = flat.reduce((min, d) => d.value < min.value ? d : min, flat[0]);

    const dotX = x(lowest.value);
    const dotY = y(lowest["Reference area"]);

    const labelText = `Lowest: ${lowest["Reference area"]}`;

    // Measure text width
    const tempText = g.append("text")
      .attr("x", -9999)
      .attr("y", -9999)
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .text(labelText);

    const textWidth = tempText.node().getBBox().width;
    tempText.remove();

    // Draw annotation background box
    g.append("rect")
      .attr("class", "lowest-box")
      .attr("x", dotX - textWidth / 2 - 6)
      .attr("y", dotY - 28)
      .attr("width", textWidth + 12)
      .attr("height", 20)
      .attr("rx", 4)
      .attr("fill", darkMode ? "#222" : "#fff")
      .attr("stroke", darkMode ? "#aaa" : "#999")
      .attr("stroke-width", 0.5)
      .attr("opacity", 0.9);

    // Draw annotation text
    g.append("text")
      .attr("class", "lowest-annotation")
      .attr("x", dotX)
      .attr("y", dotY - 14)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("fill", darkMode ? "#eee" : "red")
      .text(labelText);
  }
}

function drawHeatmap(data) {
  // Setup x and y scales for heatmap
  const countries = [...new Set(data.map(d => d["Reference area"]))];

  const x = d3.scaleBand()
    .domain(educationLevels)
    .range([0, width])
    .padding(0.05);

  const y = d3.scaleBand()
    .domain(countries)
    .range([0, height])
    .padding(0.05);

  // Color scale for heatmap (sequential)
  const colorScale = d3.scaleSequential()
    .interpolator(d3.interpolateYlGnBu)
    .domain([0, 100]);

  // Draw heatmap squares
  g.selectAll()
    .data(data)
    .join("rect")
    .attr("x", d => x(d["Socio-economic status"]))
    .attr("y", d => y(d["Reference area"]))
    .attr("width", x.bandwidth())
    .attr("height", y.bandwidth())
    .attr("fill", d => colorScale(parseFloat(d.OBS_VALUE)))
    .on("mouseover", function(event, d) {
      // Show tooltip
      tooltip.html(`<strong>${d["Reference area"]}</strong><br/>${d["Socio-economic status"]}: ${d.OBS_VALUE}%`)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 40) + "px")
        .transition().duration(300)
        .style("opacity", 1)
        .style("transform", "translateY(-10px)");
    })
    .on("mouseout", function() {
      // Hide tooltip
      tooltip.transition().duration(500)
        .style("opacity", 0)
        .style("transform", "translateY(0px)");
    });

  // Add axes
  g.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));

  g.append("g")
    .call(d3.axisLeft(y));
}