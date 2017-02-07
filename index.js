var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;
users = [];
connections = [];

server.listen(port, function(){
  console.log('Server listening at port %d', port);
});

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/chatroom.html');
});
// Routing
// app.use(express.static(__dirname + '/public'));

// Chatroom
io.on('connection', function(socket){

  connections.push(socket);
  console.log('Connected: %s sockets connected',connections.length);

  //Disconnect
  socket.on('disconnect',function(data){
    connections.splice(connections.indexOf(socket), 1);
    console.log('Disconnected: %s sockets connected',connections.length);

    if(!socket.username) return;
    users.splice(users.indexOf(socket.username), 1);
    updateUsernames();
  })

  // when the client emits 'new message', this listens and executes
  socket.on('send message', function (data) {
    // we tell the client to execute 'new message'
    io.sockets.emit('new message', {//socket.broadcast.emit
      username: socket.username,
      message: data
    });
  });

  socket.on('user join', function (data,callback) {
    console.log('new user join');
    callback(true);
    socket.username = data;
    users.push(socket.username);
    updateUsernames();
  });

  function updateUsernames(){
    // socket.emit('get users',users);//Update only current session!
    io.sockets.emit('users update',users);//update all!
    // socket.broadcast.emit('get users',users);//update except current session!
  }
  //TODO: 用户正在输入！
  // when the client emits 'typing', we broadcast it to others
    socket.on('typing', function () {
      socket.broadcast.emit('typing', {
        username: socket.username
      });
    });

  // when the client emits 'stop typing', we broadcast it to others
    socket.on('stop typing', function () {
      socket.broadcast.emit('stop typing', {
        username: socket.username
      });
    });
});
