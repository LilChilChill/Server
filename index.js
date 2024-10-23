const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const userRoute = require('./Routes/userRoute');
const friendRoute = require('./Routes/friendRoute');
const messageRoute = require('./Routes/messageRoute'); // Import messageRoute
const path = require('path');

const app = express();
require('dotenv').config();

app.use(express.json());
app.use(cors());
app.use("/api/users", userRoute);
app.use("/api/friends", friendRoute);
app.use("/api/messages", messageRoute); // Sử dụng messageRoute

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res) => {
    res.send("Hello, World!");
});

const port = process.env.PORT || 5000;
const uri = process.env.ATLAS_URI;

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*',
    }
});

// Kết nối MongoDB
mongoose.connect(uri)
    .then(() => console.log(`MongoDB connection established`))
    .catch((error) => console.log("MongoDB connection error:", error.message));

// Socket.IO logic
io.on('connection', (socket) => {
    console.log('A user connected: ' + socket.id);

    socket.on('sendMessage', (messageData) => {
        io.to(messageData.receiverId).emit('receiveMessage', messageData);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected: ' + socket.id);
    });
});

// Lắng nghe cổng server
server.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});
