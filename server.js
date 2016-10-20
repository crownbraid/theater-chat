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
        console.log(user);
        socket.username = user.username;
        socket.room = 'home';
        data.users[user.username] = user.username;
        socket.join('home');
    });

    socket.on('new-message', function (message) {
        console.log('Received message:', message);
        maintainRoomHistory(socket.room, message);
        io.sockets.in(socket.room).emit('new-message', message);
    });

    socket.on('timecode-change', function(newTimecode) {
        console.log('Media has been controlled. New timecode: ', newTimecode);
        console.log(socket.room);
        io.sockets.in(socket.room).emit('timecode-change', newTimecode); 
    });

    socket.on('timecode-change-play', function(newTimecode) {
        console.log('Media has been controlled. New timecode: ', newTimecode);
        io.sockets.in(socket.room).emit('timecode-change-play', newTimecode); 
    });

    socket.on('switchRoom', function(newroom){
        socket.leave(socket.room);
        socket.join(newroom);
        maintainRoomHistory(socket.room, socket.username + ' has left the room.');
        maintainRoomHistory(newroom, socket.username + ' has joined the room.');
        socket.emit('update-chat', newroom, data.history[newroom]);
        socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username + ' has left the room.');
        socket.room = newroom;
        socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username + ' has joined the room.');
        socket.emit('update-rooms', data.rooms, newroom);
    });

    socket.on('disconnect', function(){
        maintainRoomHistory(socket.room, socket.username + ' has disconnected.');
        // delete usernames[socket.username];
        io.sockets.emit('updateusers', data.users);
        socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
        socket.leave(socket.room);
    });
});

server.listen(8080);