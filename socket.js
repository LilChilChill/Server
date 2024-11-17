// module.exports = (io) => {
//     io.on('connection', (socket) => {
//         console.log('Người dùng kết nối: ' + socket.id);

        
//         socket.on('join', (userId) => {
//             socket.join(userId); 
//             console.log(`User ${userId} đã tham gia vào room.`);

            
//             socket.on('disconnect', () => {
//                 socket.leave(userId);
//                 console.log(`User ${userId} đã rời khỏi room.`);
//             });
//         });

        
//         socket.on('sendMessage', (messageData) => {
//             console.log('Nhận được tin nhắn từ client:', messageData);

//             const { receiverId, sender, content, file } = messageData;

            
//             console.log(`Gửi tin nhắn đến room ${receiverId}`);
//             io.to(receiverId).emit('receiveMessage', messageData);

            
//             console.log(`Gửi tin nhắn đến room ${sender}`);
//             io.to(sender).emit('receiveMessage', messageData);
//         });

        
//         socket.on('disconnect', () => {
//             console.log('Người dùng mất kết nối: ' + socket.id);
//         });
//     });
// };

module.exports = (io) => {
    const users = {}; // Lưu ánh xạ userId -> socket.id
    const groups = {}; // Lưu ánh xạ groupId -> danh sách userId

    io.on('connection', (socket) => {
        console.log('Người dùng kết nối: ' + socket.id);

        // Đăng ký userId vào socket
        socket.on('register', (userId) => {
            users[userId] = socket.id;
            console.log(`User ${userId} đã đăng ký với socket ID: ${socket.id}`);
        });

        // Tham gia phòng (group chat)
        socket.on('joinGroup', ({ userId, groupId }) => {
            socket.join(groupId); // Tham gia room
            if (!groups[groupId]) {
                groups[groupId] = [];
            }
            if (!groups[groupId].includes(userId)) {
                groups[groupId].push(userId);
            }
            console.log(`User ${userId} đã tham gia group ${groupId}`);
        });

        // Rời phòng (group chat)
        socket.on('leaveGroup', ({ userId, groupId }) => {
            socket.leave(groupId); // Rời room
            if (groups[groupId]) {
                groups[groupId] = groups[groupId].filter((id) => id !== userId);
                console.log(`User ${userId} đã rời group ${groupId}`);
            }
        });

        // Gửi tin nhắn
        socket.on('sendMessage', async (messageData) => {
            const { chatType, receiverId, groupId, sender, content, file } = messageData;

            if (chatType === 'group') {
                // Chat nhóm: gửi tin nhắn tới room
                console.log(`Gửi tin nhắn đến group ${groupId}`);
                io.to(groupId).emit('receiveMessage', messageData);
            } else if (chatType === 'private') {
                // Chat 1-1: gửi trực tiếp tới socket của người nhận
                const receiverSocketId = users[receiverId];
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit('receiveMessage', messageData);
                    console.log(`Gửi tin nhắn từ ${sender} đến ${receiverId}`);
                } else {
                    console.log(`Người dùng ${receiverId} hiện không online.`);
                }
            }
        });

        // Ngắt kết nối
        socket.on('disconnect', () => {
            console.log('Người dùng mất kết nối: ' + socket.id);
            // Xóa user khỏi danh sách
            for (const userId in users) {
                if (users[userId] === socket.id) {
                    delete users[userId];
                    console.log(`User ${userId} đã ngắt kết nối.`);
                    break;
                }
            }
        });
    });
};
