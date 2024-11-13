const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const userRoute = require('./Routes/userRoute');
const friendRoute = require('./Routes/friendRoute');
const messageRoute = require('./Routes/messageRoute');
const path = require('path');
const socketHandler = require('./socket'); // Xử lý socket trong file riêng

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
        origin: '*', // Cho phép tất cả các nguồn
    }
});

// Đảm bảo rằng messageRoute nhận được io (server socket)
app.use("/api/messages", messageRoute(io));

mongoose.connect(uri)
    .then(() => console.log(`MongoDB connection established`))
    .catch((error) => console.log("MongoDB connection error:", error.message));

// Gọi hàm xử lý socket sau khi tạo socket server
socketHandler(io);

server.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});
