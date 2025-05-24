const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

// Generate a secure JWT secret
const jwtSecret = crypto.randomBytes(32).toString('hex');

// Sample .env content
const envContent = `PORT=5000
MONGODB_URI=mongodb+srv://katrielmoses:YOUR_PASSWORD_HERE@cluster0.7ihqoei.mongodb.net/fitness-tracker?retryWrites=true&w=majority
JWT_SECRET=${jwtSecret}
`;

// Path to .env file
const envPath = path.join(__dirname, '.env');

// Check if .env already exists
if (fs.existsSync(envPath)) {
    console.log('\n.env file already exists. To regenerate, delete the existing file first.\n');
} else {
    // Create the .env file
    fs.writeFileSync(envPath, envContent);
    console.log('\n.env file created successfully!');
    console.log('IMPORTANT: Edit the .env file and replace YOUR_PASSWORD_HERE with your actual MongoDB password.\n');
}

// Display instructions
console.log('To start the server:');
console.log('1. Make sure MongoDB Atlas credentials are correct in .env');
console.log('2. Run: npm run dev');
console.log('\nIf you\'re still seeing connection errors:');
console.log('- Verify your MongoDB Atlas password is correct');
console.log('- Check that your IP is whitelisted in MongoDB Atlas');
console.log('- Ensure your MongoDB Atlas cluster is active\n'); 