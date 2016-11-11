var router = require('express').Router()
  , data = require('./data_store.js');

router.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

router.get('/rooms', function (req, res) {
    res.send(Object.keys(data.rooms));
});

router.get('/room/:roomID', function (req, res) {
    res.send(data.rooms[req.params.roomID].history);
});

router.post('/room/:roomID', function (req, res) {
    data.createRoom(req.params.roomID);
    res.send(data.rooms[req.params.roomID].history);
});

module.exports = router;