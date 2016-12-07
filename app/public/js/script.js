const createColourUpdateHandler = function(graph, dataset) {
    return function(colour) {
        var hex = colour.toHexString();
        $('#colour_hex').val(hex);
        var data = $('#colour-update-form form').serialize();
        $.ajax({
            type: 'POST',
            url: '/graph/updateColour',
            dataType: 'json',
            data: data,
            success: function(status) { 
                if (status.success) {
                    $("#msg").html(status.message);
                    dataset.updateColour(status.colour);
                    var mode = $('.btn-graph-time.active').html().toLowerCase();
                    var current = $("#date").data("date");
                    graph.update(dataset.getPoints(mode, moment(current)));
                    return;
                } else {
                    $("#msg").html(status.message);
                    return;
                }
            }
        });
    }
}

const setDate = function(time, mode) {
    var timeToDisplay;
    switch(mode) {
        case "year":
            timeToDisplay = time.format("YYYY");
            break;
        case "month":
            timeToDisplay = time.format("MMMM YYYY");
            break;
        case "week":
            timeToDisplay = time.format("wo") + " week of " + time.format("YYYY");
            break;
        default:
            throw "Invalid use of function setDate";
    }
    $("#date").html(timeToDisplay);
    $("#date").data("date", time);
}

const updateTime = function(time, mode, direction) {
    var magnitude;
    switch(mode) {
        case "year":
            magnitude = "y";
            break;
        case "month":
            magnitude = "M";
            break;
        case "week":
            magnitude = "w";
            break;
        default:
            throw "Invalid mode passed to function updateTime";
    }

    switch(direction) {
        case "forward":
            time.add(1, magnitude);
            break;
        case "backward":
            time.subtract(1, magnitude);
            break;
        default:
            throw "Invalid direction passed to function updateTime";
    }
    return time;
}