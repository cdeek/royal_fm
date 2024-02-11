const net = require('net');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const client = new net.Socket();
const host = 'localhost';
const port = 2220;

client.connect(port, host, () => {
  console.log('Connected to the chat server');
  rl.question('Enter your username: ', (username) => {
    client.write(username);
    startChat();
  });
});

function startChat() {
  rl.on('line', (input) => {
    client.write(input);
  });

  client.on('data', (data) => {
    console.log('server say: ', data.toString());
    console.log('reply to server: ');
  });

  client.on('close', () => {
    console.log('Connection closed');
    rl.close();
  });
}