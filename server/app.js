const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
const net = require('net');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
 input: process.stdin,
 output: process.stdout
})


const server = net.createServer();
//const micStream = new MicrophoneStream();

const clients = [];

server.on('connection', (socket) => {
  
  clients.push({ socket, user: `Guest${clients.length}`});
  
  const broadcastMessage = (message) => {
    clients.forEach((client) => {
      client.socket.write(message);
    });
  };
  
  const broadcastAudio = (audio) => {
    clients.forEach((client) => {
      client.socket.write(audio);
    });
  };
  
  socket.on('data', (data) => {
   const request = data.toString().trim();
   
   if (request.includes('Upgrade: websocket') || request.startsWith('GET')) {
     const key = request.match(/Sec-WebSocket-Key: (.*)/)[1].trim();
     
     const responseKey = crypto.createHash('sha1').update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
     
     const response = [
        'HTTP/1.1 101 Switching Protocols',
        'Upgrade: websocket',
        'Connection: Upgrade',
        `Sec-WebSocket-Accept: ${responseKey}`,
        '\r\n'
      ].join('\r\n');
      
      socket.write(response);
      } else {
       console.log('client say: ', request);
        rl.setPrompt('reply to client: ')
        rl.prompt();
        chat();
      }
  })
  console.log('clients online: ', clients.length);
  
  const chat = () => {
    rl.on('line', (val) => {
      socket.write(val)
    })
  };
  
  clients.forEach(u => console.log(u.user))
  
  socket.on('end', () => {
    const index = clients.findIndex((client) => client.socket === socket);
    if (index !== -1) {
      const disconnectedClient = clients.splice(index, 1)[0];
      //broadcastMessage(`[Server] ${disconnectedClient.user} left the stream\n`, null);
      console.log(`[Server] ${disconnectedClient.user} left the stream\n`)
    }
  });

  socket.on('error', (err) => {
    console.error('Socket error:', err);
  });
 
});

server.listen('2220', () => {
  console.log(`Stream Server is running on port 2220`);
});
