var express = require('express')
  , app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server)
  , data = require('./data_store.js');

app.use(express.static(__dirname + '/public'));
app.use('/', require('./routes'));

io.sockets.on('connection', function (socket) {

    socket.on('new-user', function(user){
        socket.username = user.username;
        socket.room = 'home';
        data.users[user.username] = user.username;
        socket.join('home');
    });

    socket.on('new-message', function (message) {
        data.maintainRoomHistory(socket.room, message);
        io.sockets.in(socket.room).emit('new-message', message);
    });

    socket.on('timecode-change', function(newTimecode) {
        io.sockets.in(socket.room).emit('timecode-change', newTimecode); 
    });

    socket.on('set-film', function(number) {
        data.rooms[socket.room].url = number;
        io.sockets.in(socket.room).emit('set-film', number); 
    });

    socket.on('timecode-change-play', function(newTimecode) {
        io.sockets.in(socket.room).emit('timecode-change-play', newTimecode); 
    });

    socket.on('switchRoom', function(newroom){
        socket.leave(socket.room);
        socket.join(newroom);
        socket.emit('set-film', data.rooms[newroom].url);
        data.maintainRoomHistory(socket.room, socket.username + ' has left the room.');
        data.maintainRoomHistory(newroom, socket.username + ' has joined the room.');
        socket.emit('update-chat', newroom, data.rooms[newroom].history);
        socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username + ' has left the room.');
        socket.room = newroom;
        socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username + ' has joined the room.');
    });

    socket.on('disconnect', function(){
        data.maintainRoomHistory(socket.room, socket.username + ' has disconnected.');
        // delete usernames[socket.username];
        io.sockets.emit('updateusers', data.users);
        socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
        socket.leave(socket.room);
    });
});

server.listen(8080);