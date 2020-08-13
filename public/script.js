const socket = io('http://ipaddress:3000');
const messageContainer = document.getElementById('message-container');
const roomContainer = document.getElementById('room-container');
const messageForm = document.getElementById('send-container');
const messageInput = document.getElementById('message-input');
const typingStatus = document.getElementById('status');

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

    messageInput.addEventListener('keyup', function(e) {
        if (e.keyCode == 13 || e.keyCode == 8) {
            socket.emit('stopped-typing', roomName, name);
        }
    });
}

socket.on('room-created', room => {
    const roomElement = document.createElement('div');
    const roomLink = document.createElement('a');
    roomLink.href = `/${room}`;
    roomLink.innerText = `${room}`;
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
    typingStatus.innerText = `${name} is typing`;
});

socket.on('received-stopped-typing', name => {
    typingStatus.innerText = ``;
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

function appendMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.innerText = message;
    messageContainer.append(messageElement);
    messageContainer.scrollTop = messageContainer.scrollHeight;
}
