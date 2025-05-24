const http = require('http');

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/health',
    method: 'GET',
    timeout: 5000
};

console.log('Testing connection to backend server...');

const req = http.request(options, res => {
    console.log(`Status: ${res.statusCode}`);

    let data = '';
    res.on('data', chunk => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('Response:');
        console.log(data);

        const response = JSON.parse(data);
        if (response.mongodb === 'connected') {
            console.log('\n✅ Success! Server is running and connected to MongoDB.');
        } else {
            console.log('\n❌ Server is running but not connected to MongoDB.');
        }
    });
});

req.on('error', error => {
    console.error('\n❌ Error: Server might not be running');
    console.error(`Details: ${error.message}`);
    console.error('\nMake sure:');
    console.error('1. The server is running (npm run dev)');
    console.error('2. You are in the correct directory');
    console.error('3. Port 5000 is not being used by another application');
});

req.on('timeout', () => {
    console.error('\n❌ Request timed out after 5 seconds');
    req.destroy();
});

req.end(); 