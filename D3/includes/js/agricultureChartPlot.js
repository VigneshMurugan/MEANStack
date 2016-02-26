var margin = {top: 20, right: 60, bottom: 120, left: 40},
    width = 960 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

function stackedChart(tabName , fileName){

  var x = d3.scale.ordinal()
      .rangeRoundBands([0, width], 0.4);

  var y = d3.scale.linear()
      .rangeRound([height, 0]);

  var color = d3.scale.ordinal()
      .range(["gold", "silver", "brown", "orange"]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .tickFormat(d3.format(".2s"));

      var tip = d3.tip()
      .attr('class', 'd3-tip')
      .html(function(d) {
        return "<span style='color:black'>" + d.y1 + "(kg/hg)</span>";
      })

  var svg = d3.select("#" + tabName).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.call(tip);

  d3.json("includes/json/" + fileName +".json", function(error, data) {
    if (error) throw error;

    color.domain(d3.keys(data[0]).filter(function(key) { return key !== "Year"; }));

    data.forEach(function(d) {
      var y0 = 0;
      d.production = color.domain().map(function(name) { return {name: name, y0: y0, y1: y0 += +d[name]}; });
      d.total = d.production[d.production.length - 1].y1;
    });

    data.sort(function(a, b) { return parseInt(a.Year) - parseInt(b.Year); });

    x.domain(data.map(function(d) { return d.Year; }));
    y.domain([0, d3.max(data, function(d) { return d.total; })]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Production");

    var state = svg.selectAll(".Year")
        .data(data)
        .enter().append("g")
        .attr("class", "g")
        .attr("transform", function(d) { return "translate(" + x(d.Year) + ",0)"; });

    state.selectAll("rect")
        .data(function(d) { return d.production; })
        .enter().append("rect")
        .attr("width", x.rangeBand())
        .attr("y", function(d) { return y(d.y1); })
        .attr("height", function(d) { return y(d.y0) - y(d.y1); })
        .style("fill", function(d) { return color(d.name); })
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);

    var legend = svg.selectAll(".legend")
        .data(color.domain().slice().reverse())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(" + (600 - (i * 100)) * -1 + ",-10)"; });

    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return d == "AP" ? "Andhra Pradesh" : d == "TN" ? "Tamilnadu" : d == "KA" ? "Karnataka" : "Kerala" ; });
  });
}

function barchartPlot(tabName, fileName , color){

  var x = d3.scale.ordinal()
  .rangeRoundBands([0, width], 0.3);

  var y = d3.scale.linear()
  .range([height, 0]);

  var xAxis = d3.svg.axis()
  .scale(x)
  .tickPadding(6)
  .orient("bottom");

  var yAxis = d3.svg.axis()
  .scale(y)
  .orient("left");

  var tip = d3.tip()
  .attr('class', 'd3-tip')
  .html(function(d) {
    return "<span style='color:white'>" + d.y + "(tons)</span>";
  })


  var svg = d3.select("#" + tabName).append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg.call(tip);


  d3.json("includes/json/"+ fileName +".json", function(error, data) {
    if (error) console.log(error);
    x.domain(data.map(function(d) { return d.x; }));
    y.domain([0, fileName == "Oilseeds" ? 25 : 160]);

    svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .selectAll("text")
    .style("text-anchor", "end")
    .style("fill","white")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-40)" );

    svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", "0.5em")
    .style("text-anchor", "end")
    .text("Production");

    svg.selectAll(".bar")
    .data(data)
    .enter().append("rect")
    .attr("class", "oilSeedBar")
    .attr("x", function(d) { return x(d.x); })
    .attr("width", x.rangeBand())
    .attr("y", function(d) { return y(d.y); })
    .attr("height", function(d) { return height - y(d.y); })
    .on('mouseover', tip.show)
    .on('mouseout', tip.hide);
  });
};

function commercialPlot(){

  var x = d3.scale.ordinal()
  .rangeRoundBands([0, width], 0.1);

  var y = d3.scale.linear()
  .range([height, 0]);

  var xAxis = d3.svg.axis()
  .scale(x)
  .orient("bottom");

  var yAxis = d3.svg.axis()
  .scale(y)
  .orient("left");

  var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(d) {
    return "<span style='color:black'>" + d.Quantity + "(million kg)</span>";
  })
  var line = d3.svg.line()
  .x(function(d) { return x(d.Year) + 17.5; })
  .y(function(d) { return y(d.Quantity); });

  var svg = d3.select("#tab3").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg.call(tip);

  d3.json("includes/json/Commercial.json", function(error, data) {
    if (error) throw error;
    x.domain(data.map(function(d) { return d.Year}));
    y.domain(d3.extent(data, function(d) { return d.Quantity; }));

    svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

    svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Production");

    svg.append("path")
    .datum(data)
    .attr("class", "line")
    .attr("d", line);

    svg.selectAll("dot").data(data).enter().append("circle")
                        .attr("r", 5)
                        .attr('fill', 'red')
                        .attr("cx", function(d) { return x(d.Year) + 17.5;})
                        .attr("cy", function(d) { return y(d.Quantity);  })
                        .on('mouseover', tip.show)
                        .on('mouseout', tip.hide);
  });
};
