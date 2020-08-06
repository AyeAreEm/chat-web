# chat-web

## server.js, script.js, index.ejs, rooms.ejs

server.js => express server and socket.io server

script.js => client side javascript to connect to websockets

index.ejs => index page with javascript that loads links for chat rooms

room.ejs => room page for chat rooms

## server.js
```javascript
  //creating the express server and socket.io server
  const express = require('express');
  const app = express();
  const server = require('http').Server(app);
  const io = require('socket.io')(server);

  //setting the routes
  app.get('/', (req, res) => {
    res.render('index', { rooms: rooms });
  });

  app.post('/room', (req, res) => {
    if (rooms[req.body.room] != null) {
      return res.redirect('/');
    }
    rooms[req.body.room] = { users: {} };
    res.redirect(req.body.room);
    // Send message that new room was created
    io.emit('room-created', req.body.room);
  });

  app.get('/:room', (req, res) => {
    if (rooms[req.params.room] == null) {
      return res.redirect('/');
    }
    res.render('room', { roomName: req.params.room });
  });
  
  //handling socket events
  io.on('connection', socket => {
    socket.on('new-user', (room, name) => {
        socket.join(room);
        rooms[room].users[socket.id] = name;
        socket.to(room).broadcast.emit('user-connected', name);
    });
    socket.on('typing', (room, name) => {
        socket.to(room).broadcast.emit('received-typing', name);
    });
    socket.on('send-chat-message', (room, message) => {
        socket.to(room).broadcast.emit('chat-message', { message: message, name: rooms[room].users[socket.id] });
    });
    socket.on('disconnect', () => {
        getUserRooms(socket).forEach(room => {
            socket.to(room).broadcast.emit('user-disconnected', rooms[room].users[socket.id]);
            delete rooms[room].users[socket.id];
        });
    });
```

## script.js
```javascript
  //connecting to express and socket server
  const socket = io('http://10.0.1.14:3000');
  
  //handling prompts and sending request for chatting
  if (messageForm != null) {
    const name = prompt('What is your name?');
    appendMessage('You joined');
    socket.emit('new-user', roomName, name);

    messageForm.addEventListener('submit', e => {
        e.preventDefault();
        const message = messageInput.value;
        appendMessage(`You: ${message}`);
        socket.emit('send-chat-message', roomName, message);
        messageInput.value = '';
    });

    messageInput.addEventListener('keyup', function() {
        socket.emit('typing', roomName, name);
    });
  }
  
  //handling events sent by the server
  socket.on('room-created', room => {
    const roomElement = document.createElement('div');
    roomElement.innerText = room;
    const roomLink = document.createElement('a');
    roomLink.href = `/${room}`;
    roomLink.innerText = 'join';
    roomContainer.append(roomElement);
    roomContainer.append(roomLink);
  });
  
  socket.on('private-room-created', room => {
    const privateElement = document.createElement('div');
    const privateLink = document.createElement('a');
    privateLink.href = `/private-room/${room}`;
    privateLink.innerText = ``;
    roomContainer.append(privateElement);
    roomContainer.append(privateLink);
  });
  
  socket.on('received-typing', name => {
    if (messageInput) {
        typingStatus.innerHTML = `${name} is typing`;
    } else if (messageInput.value == '') {
        typingStatus.innerHTML = '';
    }
  });
  
  socket.on('chat-message', data => {
    appendMessage(`${data.name}: ${data.message}`);
  });

  socket.on('user-connected', name => {
    appendMessage(`${name} connected`);
  });

  socket.on('user-disconnected', name => {
    appendMessage(`${name} disconnected`);
  });
```

## index.ejs
```ejs
  <!-- show all chat rooms created -->
  <div id="room-container">
    <p>Rooms:</p>
    <% Object.keys(rooms).forEach(room => { %>
      <a href="/<%= room%>"><%= room%></a>
    <%}) %>
  </div>
    
  <!-- send post request when created a room -->
  <form action="/room" method="POST">
    <input type="text" name="room" required autocomplete="off" placeholder="space for private room"><br>
    <button type="submit">New Room</button><br>
    <button type="submit" formaction="/private-room">Private New Room</button>
  </form>
```
## room.ejs
```ejs
  <!-- show if user is typing -->
  <!-- still has bugs though -->
  <p><i id="status"></i></p>
   
   <!-- show messages -->
   <div id="message-container"></div>
   
   <!-- input and button to send messages -->
   <form id="send-container">
    <input type="text" id="message-input" autocomplete="off" autofocus>
    <button type="submit" id="send-button">Send</button>
   </form>
```

## Working on new features
1. fix bugs with showing if the user is typing or not
2. fix private rooms
