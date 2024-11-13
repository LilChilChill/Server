module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('Người dùng kết nối: ' + socket.id);

        
        socket.on('join', (userId) => {
            socket.join(userId); 
            console.log(`User ${userId} đã tham gia vào room.`);

            
            socket.on('disconnect', () => {
                socket.leave(userId);
                console.log(`User ${userId} đã rời khỏi room.`);
            });
        });

        
        socket.on('sendMessage', (messageData) => {
            console.log('Nhận được tin nhắn từ client:', messageData);

            const { receiverId, sender, content, file } = messageData;

            
            console.log(`Gửi tin nhắn đến room ${receiverId}`);
            io.to(receiverId).emit('receiveMessage', messageData);

            
            console.log(`Gửi tin nhắn đến room ${sender}`);
            io.to(sender).emit('receiveMessage', messageData);
        });

        
        socket.on('disconnect', () => {
            console.log('Người dùng mất kết nối: ' + socket.id);
        });
    });
};
