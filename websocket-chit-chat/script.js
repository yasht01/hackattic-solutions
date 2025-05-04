import axios from 'axios';
import { WebSocket } from 'ws';

let serverToken = '';
let startTimestamp = Date.now();

async function fetchProblemData() {
  try {
    const response = await axios.get('https://hackattic.com/challenges/websocket_chit_chat/problem?access_token=');
    if (response.status === 200) {
      serverToken = response.data.token;
    }
  } catch (error) {
    console.log(JSON.stringify(error));
    throw error;
  }
}

function sanitizeTimestamp(messageInterval) {
  const intervals = [700, 1500, 2000, 2500, 3000];

  let selectedInterval = 700;
  let deviation = Math.abs(messageInterval - intervals[intervals.length - 1]);

  for (let i = 0; i < intervals.length; i++) {
    if(Math.abs(messageInterval - intervals[i]) <= deviation) {
      selectedInterval = intervals[i];
      deviation = Math.abs(messageInterval - intervals[i]);
    }
  }

  return selectedInterval;
}

function initialiseWebSocketServer() {
  const ws = new WebSocket(`wss://hackattic.com/_/ws/${serverToken}`);

  ws.on('open', function open() {
    startTimestamp = Date.now();
    console.log('Connected to WebSocket server');
  });

  ws.on('message', function message(data) {
    console.log('Received:', data.toString());
    if (data.toString() === 'ping!') {
      console.log(`Raw timestamp: ${Date.now() - startTimestamp}`);
      console.log(`Sanitized timestamp: ${sanitizeTimestamp(Date.now() - startTimestamp)}`);
      ws.send(sanitizeTimestamp(Date.now() - startTimestamp));
      startTimestamp = Date.now();
    }

    if (data.toString().startsWith('congratulations!')) {
      const secretKeyMatch = data.toString().match(/"([^"]+)"/);
      if (secretKeyMatch && secretKeyMatch[1]) {
        const secretKey = secretKeyMatch[1];
        console.log('Extracted secret key:', secretKey);
        uploadSecretKey(secretKey);
      }
    }
  });

  ws.on('close', function close() {
    console.log('Connection closed');
  });

  ws.on('error', function error(err) {
    console.error('WebSocket error:', err);
  });
}

function uploadSecretKey(secretKey) {
  axios.post(
    'https://hackattic.com/challenges/websocket_chit_chat/solve?access_token=',
    {
      'secret': secretKey,
    },
  )
    .then(function (response) {
      console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
      console.log(JSON.stringify(error));
    });
}

async function startServer() {
  try {
    await fetchProblemData();
    initialiseWebSocketServer();
  } catch (error) {
    console.error('Failed to start server:', error);
  }
}

startServer();