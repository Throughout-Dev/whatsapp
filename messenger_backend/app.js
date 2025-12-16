// app.js
// const express = require('express');
// const cors = require('cors');
const express = require("express");
const cors = require("cors");
const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables from .env file
const { errors } = require('celebrate');
// const whatsappRoutes = require('./routes/whatsappRoutes.js'); // We will update this file's usage
const whatsappRoutes = require("./routes/whatsappRoutes");
const { initializeWhatsAppClient, isClientReady,client} = require('./services/whatsappService.js');
const http = require('http');
const { Server } = require("socket.io");
const fs = require('fs');
const path = require('path');
// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        // origin: "http://localhost:5173", // Your frontend URL
        origin: ["https://whatsapp.gapalyze.com"],
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected successfully.'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1); // Exit process with failure
    });

// Initialize WhatsApp Client
initializeWhatsAppClient(io); // Pass the io instance to the service

io.on('connection', (socket) => {
    console.log('A user connected to Socket.IO');

    // Immediately send the current status to the newly connected client
    if (isClientReady()) {
        socket.emit('client_ready');
    }

    socket.on('disconnect', () => console.log('User disconnected'));
});

// Middlewares
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Routes
app.use('/api/whatsapp', whatsappRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is running.' });
});
//  this api helps in logging out user so they do not need to delete the file manually.
app.post('/logout', async (req, res) => {
    try {
        if (client) {
            await client.logout(); // Logs out the client
            
            // Delete the auth folder manually
            const authPath = path.join(__dirname, 'wwebjs_auth'); // Adjust path if needed
            if (fs.existsSync(authPath)) {
                fs.rmSync(authPath, { recursive: true, force: true });
                console.log('wwebjs_auth folder deleted');
            }

            // Re-initialize client to generate new QR
            client.initialize();

            io.emit('status_change', 'Logged out. Please scan new QR code.');
            res.status(200).json({ message: 'Logged out and auth reset successfully' });
        } else {
            res.status(400).json({ message: 'Client is not initialized' });
        }
    } catch (err) {
        console.error('Logout error:', err);
        res.status(500).json({ message: 'Logout failed', error: err.message });
    }
});

// Celebrate error handler
app.use(errors());

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'An unexpected error occurred.',
        message: err.message,
    });
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
