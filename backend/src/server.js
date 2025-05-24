require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/user.routes');
const workoutRoutes = require('./routes/workout.routes');

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error('Error: Missing required environment variables:');
    console.error(missingEnvVars.join(', '));
    console.error('\nPlease create a .env file in the backend directory with the following variables:');
    console.error(`
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
    `);
    process.exit(1);
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection Options
const mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};

// Connect to MongoDB with better error handling
mongoose.connect(process.env.MONGODB_URI, mongooseOptions)
    .then(() => {
        console.log('Successfully connected to MongoDB Atlas');

        // Only start the server if MongoDB connection is successful
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('\nMongoDB connection error:');
        if (err.name === 'MongoServerSelectionError') {
            console.error('Could not connect to MongoDB. Please check:');
            console.error('1. Your internet connection');
            console.error('2. Your MongoDB URI is correct');
            console.error('3. Your MongoDB Atlas username and password are correct');
            console.error('4. Your IP address is whitelisted in MongoDB Atlas');
        } else {
            console.error(err.message);
        }
        process.exit(1);
    });

// Routes
app.use('/api/users', userRoutes);
app.use('/api/workouts', workoutRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        env: {
            port: process.env.PORT || 5000,
            mongodbConfigured: !!process.env.MONGODB_URI,
            jwtConfigured: !!process.env.JWT_SECRET
        }
    });
}); 