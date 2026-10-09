const http = require('http');
const WebSocket = require('ws');

const PORT = process.env.PORT || 10000;
const APP_ID = process.env.DERIV_APP_ID || '34D1FRY9VtJJDYzYNN75H';

// 1. Create HTTP Server for Render Health Check
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Deriv Backend Service Running!');
});

// 2. Attach WebSocket Server for Frontend Clients
const wss = new WebSocket.Server({ server });

wss.on('connection', (frontendWs) => {
    console.log('Frontend client connected to backend WebSocket');

    // Open connection to Deriv API for this client
    const derivWs = new WebSocket(`wss://ws.derivws.com/websockets/v3?app_id=${APP_ID}`);

    derivWs.on('open', () => {
        console.log('Connected to Deriv WebSocket for frontend client');
        // Automatically subscribe to Volatility 100 ticks
        derivWs.send(JSON.stringify({ ticks: 'R_100', subscribe: 1 }));
    });

    // Forward messages from Deriv -> Frontend
    derivWs.on('message', (data) => {
        if (frontendWs.readyState === WebSocket.OPEN) {
            frontendWs.send(data.toString());
        }
    });

    // Forward incoming messages from Frontend -> Deriv (e.g., Auth, Trade calls)
    frontendWs.on('message', (message) => {
        if (derivWs.readyState === WebSocket.OPEN) {
            derivWs.send(message.toString());
        }
    });

    frontendWs.on('close', () => {
        derivWs.close();
        console.log('Frontend client disconnected');
    });
});

// 3. Start Server
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend server running on port ${PORT}`);
});
