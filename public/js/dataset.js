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
        d.date = parseInt(moment(d.date).format('DDD'));
        return d;
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
        d.date = parseInt(moment(d.date).format('D'));
        return d;
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
        d.date = parseInt(moment(d.date).format('d')) + 1; // Adding 1 because week starts at 0
        return d;
    }
    if (conversion) {
        return loop(this.data, condition, converter);
    } else {
        return loop(this.data, condition, false);
    }
}