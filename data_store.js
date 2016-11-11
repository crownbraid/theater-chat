module.exports = {
	rooms: {'home': {roomname: 'home', url: null, history: []}},
	users: {},
	createRoom: function(roomName) {
            this.rooms[roomName] = {roomname: roomName, url: 'one', history: []};
        },
    changeURL: function(roomName, url) {
            this.rooms[roomName].url = url;
        },
	maintainRoomHistory: function(roomName, message) {
            var hist = this.rooms[roomName].history;
            hist.push(message);
            while (hist.length > 30) {
                hist.shift();
            }
            this.rooms[roomName].history = hist;
        }
}