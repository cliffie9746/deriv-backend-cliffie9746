const WebSocket = require('ws');

const APP_ID = process.env.DERIV_APP_ID || '34D1FRY9VtJJDYzYNN75H';

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
