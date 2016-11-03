var Graph = function(container, points, options) {
    var self = this;
    this.chart = document.getElementById(container);
    this.options = options;
    this.cx = this.chart.clientWidth;
    this.cy = options.cy ? options.cy : 600;
    this.points = points;
}

var scatterPlot = function(container, points, options) {
    Graph.call(this, container, points, options);
    var self = this;
    self.setProperties();

    this.vis = d3.select(this.chart).append("svg")
        .attr('id', 'plot-svg')
        .attr('class', 'scatter-plot')
        .attr('width', this.cx)
        .attr('height', this.cy)
        .append('g')
        .attr('transform', 'translate(' + this.padding.left + "," + this.padding.top + ")");

    this.xAxis = this.vis.append("g")
        .attr('class', 'x axis');
    this.yAxis = this.vis.append("g")
        .attr('class', 'y axis');

    self.draw();
}

scatterPlot.prototype.setProperties = function() {
    var self = this;
    this.padding = {
        "top": 25,
        "bottom": 25,
        "left": 25,
        "right": 25
    };

    this.size = {
        "width": self.cx - self.padding.left - self.padding.right,
        "height": self.cy - self.padding.top - self.padding.bottom
    };

    this.x = d3.scaleTime()
        .domain([this.options.xmin, this.options.xmax])
        .range([0, this.size.width]);

    this.y = d3.scaleLinear()
        .domain([0, d3.max(this.points, function(d) { return d.value; }) + 10])
        .range([this.size.height, 0]);

    this.xAxisFormat = d3.axisBottom(this.x)
        .ticks(this.options.numTimeTicks)
        .tickFormat(this.options.timeFormat)
        .tickSizeOuter(0);
}

scatterPlot.prototype.draw = function() {
    var self = this;
    var circle = this.vis.selectAll("circle").data(this.points);

    circle.enter().append("circle")
        .attr("cx", function(d) { return self.x( new Date(d.date) ); })
        .attr("cy", function(d) { return self.y(d.value); })
        .attr("r", 3)
        .style("fill", function(d) { return d.colour; });
        
    circle
        .attr("cx", function(d) { return self.x( new Date(d.date) ); })
        .attr("cy", function(d) { return self.y(d.value); })
        .attr("r", 3)
        .style("fill", function(d) { return d.colour; });
    
    circle.exit().remove();

    this.xAxis
        .attr("transform", "translate(0," + this.size.height + ")")
        .call(this.xAxisFormat)
    this.yAxis
        .call(d3.axisLeft(this.y));
}

scatterPlot.prototype.update = function(points, options) {
    var self = this;
    self.options = options;
    self.points = points;

    self.setProperties();
    self.draw();
}