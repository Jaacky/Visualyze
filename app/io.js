module.exports = function(io) {
    io.on('connection', function(socket) {
        console.log('We have a user connected!');
        // socket.emit('fusion request', 'hello');

        socket.on('fusion request', function(msg) {
            console.log('in server', msg);
        });
    });
}

