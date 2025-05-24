const http = require('http');

console.log('Testing connection to server...');

// Create a simple HTTP request
const req = http.get('http://localhost:5000/health', (res) => {
    console.log(`Status Code: ${res.statusCode}`);

    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('Response Body:');
        console.log(data);
        console.log('\nServer is running correctly!');
    });
}).on('error', (err) => {
    console.error('Error connecting to server:');
    console.error(err.message);
}); 