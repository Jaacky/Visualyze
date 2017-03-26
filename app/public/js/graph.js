var Graph = function(container, points, options) {
    var self = this;
    this.chart = document.getElementById(container);
    this.options = options;
    this.points = points;
    this.highlight = {};
}

var scatterPlot = function(container, points, options) {
    Graph.call(this, container, points, options);
    var self = this;
    self.setProperties();

    this.svg = d3.select(this.chart).append("svg")
        .attr('id', 'plot-svg')
        .attr('class', 'scatter-plot')
        .attr('width', this.cx)
        .attr('height', this.cy);
    this.vis = this.svg
        .append('g')
        .attr('transform', 'translate(' + this.padding.left + "," + this.padding.top + ")");

    if (!self.options.sample) {
        this.tooltip = d3.select(document.getElementById('tooltip'));
        this.tooltipTitle = d3.select(document.getElementById(self.tooltip.attr("data-expand-by")));
        this.tooltipText = d3.select(document.getElementById('tooltip-text'));
        this.removePoint = d3.select(document.getElementById('remove-point'));
    }   

    this.xAxis = this.vis.append("g")
        .attr('class', 'x axis');
    this.yAxis = this.vis.append("g")
        .attr('class', 'y axis');

    self.draw();
}

scatterPlot.prototype.setProperties = function() {
    var self = this;
    
    this.cx = this.chart.clientWidth;
    // this.cy = self.options.cy ? self.options.cy : window.innerHeight - $(self.chart).offset().top;
    this.cy = self.options.cy ? 
        self.options.cy : 
        // window.innerHeight - self.chart.getBoundingClientRect().top + window.pageYOffset;
        window.innerHeight - self.chart.getBoundingClientRect().top + document.body.getBoundingClientRect().top;
    /*
        window.innerHeight gets the total height of the window
        self.chart.getBoundingClientRect().top gets the position of the top of the chart
        document.body.getBoundingClientRect().top gets the position away from the top
        So then this.cy will be whatever vertical space is left between the top of the graph and the bottom of the window
        AT THE FIRST LOAD
    */
    
    this.padding = {
        "top": 10,
        "bottom": 35,
        "left": self.options.pleft ? self.options.pleft : 25,
        "right": 10
    };

    this.size = {
        "width": self.cx - self.padding.left - self.padding.right,
        "height": self.cy - self.padding.top - self.padding.bottom
    };

    if (this.svg) {
        this.svg
            .attr('width', this.cx)
            .attr('height', this.cy);
    }

    this.x = d3.scaleTime()
        .domain([this.options.xmin, this.options.xmax])
        .range([0, this.size.width]);


    var yMax = d3.max(this.points, function(subpts) { return d3.max(subpts, function(d) { console.log(d); return d.value; }); });
    this.y = d3.scaleLinear()
        .domain([0, yMax])
        .range([this.size.height, 0]);

    this.xAxisFormat = d3.axisBottom(this.x)
        .ticks(this.options.numTimeTicks)
        .tickFormat(this.options.timeFormat)
        .tickSizeOuter(0);

    this.yAxisFormat = d3.axisLeft(this.y)
        .tickSizeOuter(0);

    this.line = d3.line()
        .x(function(d) { return self.x( new Date(d.date) ); })
        .y(function(d) { return self.y(d.value); });
}

// scatterPlot.prototype.addLine = function() {
//     var self = this;
//     pts = getLine(self.points);
//     console.log(pts);
//     var line = d3.line()
//         .x(function(d) { console.log(new Date(d.date)); return self.x(new Date(d.date)); })
//         .y(function(d) { console.log(self.y(d.value)); return self.y(d.value); });

//     createPath(this.points);
//     var lines = this.vis.selectAll(".graph-line").data(this.points);
//     // console.log(lines);
//     lines.enter().append("path")
//         .attr("class", "hello")
//         .attr("fill", "none")
//         .attr("stroke", function(d) { return hexToRgbA(d.colour, 0.55); })
//         .attr("stroke-width", 2)
//         .attr("d", line);

//     lines
//         .attr("fill", "none")
//         .attr("stroke", function(d) { return hexToRgbA(d.colour, 0.55); })
//         .attr("stroke-width", 2)
//         .attr("d", line);
// }

scatterPlot.prototype.draw = function() {
    var self = this;
    var circle = this.vis.selectAll("circle").data([].concat.apply([], this.points));

    
    circle.enter().append("circle")
        .attr("cx", function(d) { return self.x( new Date(d.date) ); })
        .attr("cy", function(d) { return self.y(d.value); })
        .attr("r", 5)
        .style("fill", function(d) {
            console.log(this.points);
            if (Object.keys(self.highlight).length) {
                if (d[self.highlight.id] == self.highlight.val) {
                    return hexToRgbA(d.colour, 0.9);
                } else {
                    return hexToRgbA(d.colour, 0.35); 
                }
            } else {
                return hexToRgbA(d.colour, 0.55); 
            }
        })
        .style("cursor", "pointer")
        .on('click', function(d) {
            if (!self.options.sample) {
                var selectedAlready;
                if (d3.select(this).attr("class")) {
                    selectedAlready = true;
                } else {
                    selectedAlready = false;
                }
                d3.selectAll("circle").attr("class", "");
                if (!selectedAlready) {
                    d3.select(this).attr("class", "selected");

                    if (!self.removePoint.empty()) {
                        self.removePoint.attr("class", "active");
                        d3.select(document.getElementById('point_id')).attr('value', d.id);
                    }

                    self.tooltip.classed("active", true);
                    self.tooltipTitle.classed("active", true);
                    self.tooltipText.html(formatTooltip(d));
                } else {
                    self.tooltipText.html("No selected point.");
                    if (!self.removePoint.empty()) {
                        self.removePoint.attr("class", "");
                    }
                }
            }
        });
        
    circle
        .attr("cx", function(d) { return self.x( new Date(d.date) ); })
        .attr("cy", function(d) { return self.y(d.value); })
        .attr("r", 5)
        .style("fill", function(d) { 
            if (Object.keys(self.highlight).length) {
                if (d[self.highlight.id] == self.highlight.val) {
                    return hexToRgbA(d.colour, 0.9);
                } else {
                    return hexToRgbA(d.colour, 0.35); 
                }
            } else {
                return hexToRgbA(d.colour, 0.55); 
            }
        })
        .style("cursor", "pointer");
    
    circle.exit().remove();

    var line = d3.line()
        .x(function(d) { return self.x(new Date(d.date)); })
        .y(function(d) { return self.y(d.value); })
        .curve(d3.curveMonotoneX);
    
    this.vis.selectAll(".line").remove();

    for (i=0; i<this.points.length; i++) {
        var linePts = getLine(this.points[i], 'avg');
        
        if (linePts.length > 0) {
            this.vis.append("path")
                .datum(linePts)
                .attr("class", "line")
                .attr("fill", "none")
                .attr("stroke", function(d) { console.log(d); return hexToRgbA(d[0].colour, 0.55) })
                .attr("stroke-linejoin", "round")
                .attr("stroke-linecap", "round")
                .attr("stroke-width", 2)
                .attr("d", line);
        }
    }

    this.xAxis.selectAll("*").remove();
    this.xAxis
        .attr("transform", "translate(0," + this.size.height + ")")
        .call(this.xAxisFormat);
    
    if (window.matchMedia('(max-width: 992px)').matches || self.options.sample) {
        this.xAxis.selectAll(".tick text")
            .attr("class", function(d, i) {
                if (i%2 != 0) d3.select(this).remove();
            });
    }
        
    this.yAxis
        .call(this.yAxisFormat);
}

scatterPlot.prototype.update = function(points, options, highlight) {
    var self = this;
    if (options) { self.options = options; }
    if (points) { self.points = points; }
    if (highlight) { console.log(highlight); self.highlight = highlight; }

    self.setProperties();
    self.draw();
}

function formatTooltip(d) {
    html = "";
    // html += "In " + d.owner + "'s " + d.graph + " graph:<br>";
    // html += d.value + " on " + moment(d.date).format("MMM D, YY"); 
    html += "Owner: " + d.owner + "<br>";
    html += "Graph: " + d.graph + "<br>";
    html += "Value: " + d.value + "<br>";
    html += "On: " + moment(d.date).format("MMM D, YYYY");

    return html;
}

function avgOp(curr, value, i, j, final) {
    // if (j-i-1 == 0) {
    //     return (curr + value)
    // }
    return ((curr * (j-i)) + value) / (j-i+1);
}

function maxOp() {
    return 0;
}

function minOp() {
    return 0;
}

function getLine(points, type) {
    var valOp;
    switch(type) {
        case "max":
            valOp = maxOp;
            break;
        case "avg":
            valOp = avgOp;
            break;
        case "min":
            valOp = minOp;
            break;
    }
    var i=0;
    pts = []
    while (i < points.length) {
        pt = points[i];
        // console.log(pt, pt.value, pt.date);
        var value = pt.value;
        var date = pt.date;
        var colour = pt.colour;
        var owner = pt.owner;
        var j = i + 1;
        test = [value];
        // console.log("---");
        while (j < points.length) {
            if ( (new Date(points[j].date).getTime()) === 
                 (new Date(points[i].date).getTime()) ) {
                // console.log("same day:", value, points[j].value);
                // value = valOp(value, points[j].value, i, j);
                // console.log("same day after valop:", value, i, j);
                // test.push(points[j].value);
                value += points[j].value;
                j++;
            } else {
                
                // console.log(value, points[j].value);
                // value = valOp(value, 0, i, j);
                // console.log(value, points[j].value);
                // console.log(test, i, j);
                break;
            }
        }
        // console.log(value);
        console.log(j-i);
        value = value / (j-i);
        pts.push({ value, date, colour, owner });
        i = j;
    }
    return pts;
}

function createPath(points) {
    if (points.length > 2) { 
        for (i=1; i<points.length-1; i++) {

        }
    } else {
        return points;
    }
}