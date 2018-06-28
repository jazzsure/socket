var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');
var hashName = {};
const limit = 2;

app.listen(8888);



function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }
    res.writeHead(200);
    res.end(data);
  });
}

function emitAll(io, data, fromId, username){
  if(fromId) {data.fromId = fromId;}
  if(username) {data.username = username;}
  var ids = Object.keys(io.sockets.sockets);
  ids.map(function(_socketId){
      var so = io.sockets.sockets[_socketId];
      so.emit('news', data)
  });

  //io.sockets.emit(‘String’,data);//给所有客户端广播消息，直接用这个api
}

io.on('connection', function (socket) {
  var ids = Object.keys(io.sockets.sockets);
  var _data = { count: ids.length };
  socket.emit('news', { token: socket.id });
  var overlimit = _data.count > limit;
  socket.emit('connectPeer', { peerId: overlimit ? ids[0] : null, currentPeerId: socket.id });
  //}

  emitAll(io, _data);
  //console.log('token', socket.id)

  socket.on('usersay', function (data) {
    emitAll(io, data, socket.id, hashName[socket.id]);
  });

  socket.on('username', function (data) {
    hashName[socket.id] = data.name;
  });

  socket.on('disconnect', function(data){
    console.log('disconnect', Object.keys(io.sockets.sockets).length);
    var _data = {count: Object.keys(io.sockets.sockets).length}
    emitAll(io, _data);
  });
})
