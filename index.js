const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const userRoute = require('./Routes/userRoute');
const friendRoute = require('./Routes/friendRoute');
const messageRoute = require('./Routes/messageRoute');
const path = require('path');

const app = express();
require('dotenv').config();

app.use(express.json());
app.use(cors());
app.use("/api/users", userRoute);
app.use("/api/friends", friendRoute);

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

app.use("/api/messages", messageRoute(io));

mongoose.connect(uri)
    .then(() => console.log(`MongoDB connection established`))
    .catch((error) => console.log("MongoDB connection error:", error.message));

io.on('connection', (socket) => {
    console.log('Người dùng kết nối: ' + socket.id);

    socket.on('sendMessage', (messageData) => {
        
        io.to(messageData.receiverId).to(messageData.sender).emit('receiveMessage', messageData);
    });

    socket.on('disconnect', () => {
        console.log('Người dùng mất kết nối: ' + socket.id);
    });
});

server.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});
