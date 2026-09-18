const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');

dotenv.config({
    path: process.env.DOCKER_ENV ? '.env.docker' : '.env'
});

// Guard: If Node.js c-ares DNS resolver defaulted to 127.0.0.1 (common on Windows without local DNS daemon),
// provide fallback public DNS servers (Google / Cloudflare) to resolve MongoDB Atlas SRV records.
try {
    const currentServers = dns.getServers();
    if (!currentServers || currentServers.length === 0 || (currentServers.length === 1 && currentServers[0] === '127.0.0.1')) {
        dns.setServers(['8.8.8.8', '1.1.1.1']);
    }
} catch (dnsErr) {
    // Non-fatal if setting servers fails in locked environments
}

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI;
        if (!mongoURI) {
            throw new Error('MONGODB_URI is not defined in environment variables.');
        }

        const conn = await mongoose.connect(mongoURI);
        console.log(`✅ MongoDB connected successfully: ${conn.connection.host}/${conn.connection.name}`);
        return conn;
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        throw error;
    }
};

mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB connection lost.');
});

process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed due to app termination.');
        process.exit(0);
    } catch (err) {
        process.exit(1);
    }
});

module.exports = connectDB;