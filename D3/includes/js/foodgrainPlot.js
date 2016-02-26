(function(){
var margin = {top: 20, right: 20, bottom: 150, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], 0.1);

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
      .offset([-10, 0])
      .html(function(d) {
        return "<span style='color:gold'>" + d.y + "</span>";
      })

var svg = d3.select("#tab1").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.call(tip);


d3.json("includes/json/Foodgrains.json", function(error, data) {
  if (error) console.log(error);
  x.domain(data.map(function(d) { return d.x; }));
  y.domain([0, 160]);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)" );

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "1.9em")
      .style("text-anchor", "end")
      .text("Production");

  svg.selectAll(".foodgrainBar")
      .data(data)
    .enter().append("rect")
      .attr("class", "foodgrainBar")
      .attr("x", function(d) { return x(d.x); })
      .attr("width", x.rangeBand())
      .attr("y", function(d) { return y(d.y); })
      .attr("height", function(d) { return height - y(d.y); })
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide);
});
})();
