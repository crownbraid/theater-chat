var rooms = ['home'];
var users = {};
var history = {
    home: []
};

function createRoom(roomName) {
    history[roomName] = [];
    rooms.push(roomName);
}

function maintainRoomHistory(room, message) {
    console.log(history[room], room, message);
    var hist = history[room];
    console.log(message);
    hist.push(message);
    while (hist.length > 30) {
        hist.shift();
    }
    history[room] = hist;
}

module.exports = {
	rooms: rooms,
	users: users,
	history: history,
	createRoom: createRoom,
	maintainRoomHistory: maintainRoomHistory
}