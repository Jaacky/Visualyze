function Dataset(data) {
    this.data = data;
}

function GraphDataset(graph) {
    var points = graph.points.map(function(pt) { pt.owner = graph.owner; pt.graph = graph.name; return pt; });
    Dataset.call(this, points);
}

GraphDataset.prototype = Object.create(Dataset.prototype);
GraphDataset.prototype.constructor = GraphDataset;

GraphDataset.prototype.updateColour = function(colour) {
    this.data = this.data.map(function(pt) { pt.colour = colour; return pt; });
}

function FusionDataset(fusion) {
    var points = [];
    for (var i=0; i<fusion.graphs.length; i++) {
        graph = fusion.graphs[i];
        points = points.concat(graph.points.map(function(pt) { pt.owner = graph.owner; pt.graph = graph.name; return pt; }));
    }
    Dataset.call(this, points);    
}

FusionDataset.prototype = Object.create(Dataset.prototype);
FusionDataset.prototype.constructor = FusionDataset;



/*
    mode is a string in { "year", "month", "week" }
    time is a moment object
*/
Dataset.prototype.getPoints = function(mode, time) {
    var self = this;
    switch(mode) {
        case "year":
            return self.getYearSet(time);
        case "month":
            return self.getMonthSet(time);
        case "week":
            return self.getWeekSet(time);
        default:
            throw "Improper use of getData";
    }
}

Dataset.prototype.getOptions = function(mode, time) {
    const xmax = time.endOf(mode).toDate();
    const xmin = time.startOf(mode).toDate();
    var numTimeTicks;
    var timeFormat;
    switch(mode) {
        case "year":
            numTimeTicks = d3.timeMonth.every(1);
            timeFormat = d3.timeFormat("%B");
            break;
        case "week":
            numTimeTicks = d3.timeDay.every(1);
            timeFormat = d3.timeFormat("%b %a %d");
            break;
        default:
            numTimeTicks = d3.timeWeek.every(1);
            timeFormat = d3.timeFormat("%b %a %d");
            break;
    }

    return { mode, xmax, xmin, numTimeTicks, timeFormat };
}

function loop(data, condition, converter) {
    dataset = [];
    for (var i=0; i<data.length; i++) {
        var dataDate = moment(data[i].date);
        if (condition(dataDate)) {
            if (!converter) {
                var pt = JSON.parse(JSON.stringify(data[i]));
                pt.date = moment(pt.date).startOf("day").toDate();
                dataset.push(pt);
            } else {
                dataset.push(converter(data[i]));
            }
        }
    }
    return dataset;
}

Dataset.prototype.getYearSet = function(date, conversion) {
    var year = date.year();
    var condition = function(d) {
        return year == d.year();
    }
    var converter = function(d) {
        var pt = JSON.parse(JSON.stringify(d));
        pt.date = parseInt(moment(pt.date).format('DDD'));
        return pt;
    }
    if (conversion) {
        return loop(this.data, condition, converter);
    } else {
        return loop(this.data, condition, false);
    }
}

Dataset.prototype.getMonthSet = function(date, conversion) {
    var month = date.month();
    var condition = function(d) {
        return month == d.month();
    }
    var converter = function(d) {
        var pt = JSON.parse(JSON.stringify(d));
        pt.date = parseInt(moment(pt.date).format('D'));
        return pt;
    }
    if (conversion) {
        return loop(this.getYearSet(date, false), condition, converter);
    } else {
        return loop(this.data, condition, false);
    }
}

Dataset.prototype.getWeekSet = function(date, conversion) {
    var week = date.week();
    var condition = function(d) {
        return week == d.week();
    }
    var converter = function(d) {
        var pt = JSON.parse(JSON.stringify(d));
        pt.date = parseInt(moment(pt.date).format('d')) + 1; // Adding 1 because week starts at 0
        return pt;
    }
    if (conversion) {
        return loop(this.getMonthSet(date, false), condition, converter);
    } else {
        return loop(this.data, condition, false);
    }
}