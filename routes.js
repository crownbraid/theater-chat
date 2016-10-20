var router = require('express').Router()
  , data = require('./data_store.js');

router.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

router.get('/rooms', function (req, res) {
    res.send(data.rooms);
});

router.get('/room/:roomID', function (req, res) {
    res.send(req.params.roomID);
});

router.post('/room/:roomID', function (req, res) {
    createRoom(req.params.roomID);
    res.send();
});

module.exports = router;