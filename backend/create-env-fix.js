const fs = require('fs');
const path = require('path');

// Correct .env content
const envContent = `PORT=5000
MONGODB_URI=mongodb+srv://katrielmoses:doublekings@cluster0.7ihqoei.mongodb.net/fitness-tracker?retryWrites=true&w=majority
JWT_SECRET=d7e558f7b3424ab7c8f3cb5164268f131c89f12b8a95d9e36f5f3ee21cd3
`;

// Path to .env file
const envPath = path.join(__dirname, '.env');

// Create or overwrite the .env file
fs.writeFileSync(envPath, envContent);
console.log('\n.env file has been fixed!');
console.log('The MongoDB URI now has the correct format.');
console.log('\nTry running the server again with:');
console.log('npm run dev\n'); 