var Graph = function(container, points, options) {
    var self = this;
    this.chart = document.getElementById(container);
    this.options = options;
    this.points = points;
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
        "left": 25,
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

    this.y = d3.scaleLinear()
        .domain([0, d3.max(this.points, function(d) { return d.value; }) + 10])
        .range([this.size.height, 0]);

    this.xAxisFormat = d3.axisBottom(this.x)
        .ticks(this.options.numTimeTicks)
        .tickFormat(this.options.timeFormat)
        .tickSizeOuter(0);

    this.yAxisFormat = d3.axisLeft(this.y)
        .tickSizeOuter(0);
}

scatterPlot.prototype.draw = function() {
    var self = this;
    var circle = this.vis.selectAll("circle").data(this.points);

    circle.enter().append("circle")
        .attr("cx", function(d) { return self.x( new Date(d.date) ); })
        .attr("cy", function(d) { return self.y(d.value); })
        .attr("r", 8)
        .style("fill", function(d) { return hexToRgbA(d.colour, 0.55); })
        .on('click', function(d) {
            if (!self.options.sample) {
                d3.selectAll("circle").attr("class", "");
                d3.select(this).attr("class", "selected");
                if ($('#remove-point').length) {
                    addPointRemoval(d, '#remove-point');
                    $('#point_id').val(d.id);
                }
                self.tooltip.classed("active", true);
                self.tooltipTitle.classed("active",true);
                self.tooltip.html(formatTooltip(d));
            }
        });
        
    circle
        .attr("cx", function(d) { return self.x( new Date(d.date) ); })
        .attr("cy", function(d) { return self.y(d.value); })
        .attr("r", 8)
        .style("fill", function(d) { console.log("udpating colours", d.colour); return hexToRgbA(d.colour, 0.55); });
    
    circle.exit().remove();

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

scatterPlot.prototype.update = function(points, options) {
    var self = this;
    if (options) { self.options = options; }
    if (points) { self.points = points; }

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

function addPointRemoval(d, container) {
    html = "";
    html += "<div class='action'>";
    html += "<button class='btn-remove-point'>Remove</button>"
    html += "</div>";

    $(container).html(html);
}

/*
    Modified from http://stackoverflow.com/questions/21646738/convert-hex-to-rgba
*/
function hexToRgbA(hex, opacity=1){
    var c;
    console.log(hex);
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c= hex.substring(1).split('');
        if(c.length== 3){
            c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c= '0x'+c.join('');
        return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+',' + opacity + ')';
    }
    throw new Error('Bad Hex');
}