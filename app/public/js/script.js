$(document).ready(function() {
    $('.expandable-title').on('click', function() {
        $(this).toggleClass('active');
        $($(this).data('expandFor')).toggleClass('active');
        // $($(this).data('expandFor')).addClass("animated slideInDown")
    });
});

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
            // timeToDisplay = time.format("wo") + " week of " + time.format("YYYY");
            timeToDisplay = "Week " + time.format("w") + ", " + time.format("YYYY");
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

/*
    Modified from http://stackoverflow.com/questions/21646738/convert-hex-to-rgba
*/
function hexToRgbA(hex, opacity=1){
    var c;
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


/*
    Returns an object that has current counter and fx
    Call fx to start the animation loop through data points
*/
function mkLooper(plot, pts) {
    var self = {};
    self.counter = 2; // Starting at 2 because the initial state already has 1 point

    var reset_condition, pts_handler;
    if (pts[0].constructor === Array) {
        reset_condition = pts[0].length;
        pts_handler = function(counter) {
            // Return each pts-set sliced to counter 
            var temp = pts.map(function(set) {
                return set.slice(0, counter);
            });
            // Combine each sliced pts-set into 1 set
            var temp1 = [].concat.apply([], temp);
            return temp1;
        };
    } else {
        reset_condition = pts.length;
        pts_handler = function(counter) {
            return pts.slice(0, counter);
        };
    }

    // Pause, update graph, pause, update graph, ...
    self.fx = function(initial_pause) {
        setTimeout(function() {
            // plot.update(pts.slice(0, self.counter));
            plot.update(pts_handler(self.counter));
            var ptime;
            // if (self.counter >= pts.length) {
            if (self.counter >= reset_condition) {
                self.counter = 1;
                ptime = 5000;
            } else {
                self.counter +=1;
                ptime = 1250;
            }
            self.fx(ptime);
        }, initial_pause);
    };
    return self;
}