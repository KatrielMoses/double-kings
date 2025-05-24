const express = require('express');
const app = express();

// Simple health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Root endpoint
app.get('/', (req, res) => {
    res.send('Fitness API Server is running!');
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Test server running at http://localhost:${PORT}`);
    console.log(`Visit http://localhost:${PORT}/health to check the health endpoint`);
}); 