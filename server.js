const http = require('http');
const WebSocket = require('ws');

const PORT = process.env.PORT || 10000;
const APP_ID = process.env.DERIV_APP_ID || '34D1FRY9VtJJDYzYNN75H';

// 1. Create HTTP Server for Render health check
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Deriv Backend Service is Running!');
});

// 2. Start WebSocket connection to Deriv
console.log(`Starting Deriv Backend Server with App ID: ${APP_ID}...`);
const ws = new WebSocket(`wss://ws.derivws.com/websockets/v3?app_id=${APP_ID}`);

ws.on('open', () => {
    console.log('Connected to Deriv WebSocket successfully!');
    ws.send(JSON.stringify({ ticks: 'R_100', subscribe: 1 }));
});

ws.on('message', (data) => {
    const response = JSON.parse(data);
    if (response.msg_type === 'tick') {
        console.log(`Live Volatility 100 Tick: ${response.tick.quote}`);
    }
});

ws.on('error', (err) => {
    console.error('WebSocket Error:', err);
});

// 3. Bind HTTP server to PORT
server.listen(PORT, '0.0.0.0', () => {
    console.log(`HTTP Server listening on port ${PORT}`);
});
