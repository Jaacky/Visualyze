function Dataset(data) {
    this.data = data;
}

function loop(data, condition, converter) {
    dataset = [];
    for (var i=0; i<data.length; i++) {
        var dataDate = moment(data[i].date);
        if (condition(dataDate)) {
            if (!converter) {
                dataset.push(data[i]);
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
        return loop(this.data, condition, converter);
    } else {
        return loop(this.data, condition, false);
    }
}

Dataset.prototype.getWeekSet = function(current, conversion) {
    var week = current.week();
    var condition = function(d) {
        return week == d.week();
    }
    var converter = function(d) {
        var pt = JSON.parse(JSON.stringify(d));
        pt.date = parseInt(moment(pt.date).format('d')) + 1; // Adding 1 because week starts at 0
        return pt;
    }
    if (conversion) {
        return loop(this.data, condition, converter);
    } else {
        return loop(this.data, condition, false);
    }
}