const mongoose = require('mongoose');
require('dotenv').config();

const mongoUri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;

if (!mongoUri || !dbName) {
    console.error('MongoDB URI or Database Name is not defined in the environment variables.');
    return;
}

async function connectToDatabase() {
    try {
        await mongoose.connect(mongoUri, {
            dbName: dbName,
        });
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Connected to MongoDB (Database:', dbName, ')');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

module.exports = { connectToDatabase };