const mongoose = require('mongoose');

const connectMongoDB = async () => {
    try {
        const options = {
            serverSelectionTimeoutMS: 30000,    // Increase from 5000 to 30000
            socketTimeoutMS: 45000,
            connectTimeoutMS: 30000,            // Add this
            family: 4,
            maxPoolSize: 10,                    // Add connection pool
            minPoolSize: 5,                     // Add minimum pool size
            retryWrites: true,                  // Enable retry writes
            retryReads: true                    // Enable retry reads
        };

        const conn = await mongoose.connect(process.env.MONGO_URI, options);
        
        // Add connection event listeners
        mongoose.connection.on('error', err => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected. Attempting to reconnect...');
        });

        mongoose.connection.on('connected', () => {
            console.log('MongoDB connected successfully');
        });

        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        // Don't exit the process, instead throw the error
        throw error;
    }
};

module.exports = connectMongoDB;