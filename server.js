const express = require('express');
const path = require('path');
const app = express();

// Add headers to fix Cross-Origin-Opener-Policy issues
app.use((req, res, next) => {
    // Allow cross-origin isolation
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
    next();
});

// Serve static files from the root directory
app.use(express.static(__dirname));

// Handle all routes by serving index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Use port 3001 since 8080 is already in use
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Make sure this matches the authorized origin in Google Cloud Console.`);
}); 