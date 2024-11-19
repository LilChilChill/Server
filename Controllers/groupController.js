const Group = require('../Models/groupModel');

const createGroup = async (req, res) => {
    console.log('Request body:', req.body); 
    try {
        const { groupName, members } = req.body; 
        // const userId = req.user._id; 
        console.log('Group Name:', groupName);
        console.log('Members:', members);
        
        const allMembers = [...members]; 

        const group = new Group({
            groupName, 
            members: allMembers 
        });
     
        await group.save();

        res.status(201).json({ message: "Group created successfully", group });
    } catch (error) {
        console.error('Error creating group:', error);
        res.status(500).json({ message: "Error creating group", error });
    }
};


const getUserGroups = async (req, res) => {
    try {
        const userId = req.user._id; 
        console.log('User ID:', userId);
       
        const groups = await Group.find({ members: userId }).populate('members', 'name'); 
        res.status(200).json(groups);
    } catch (error) {
        console.error('Error fetching groups:', error);
        res.status(500).json({ message: "Error fetching groups", error });
    }
};

const getGroupMessages = async (req, res) => {
    try {
        const { groupId } = req.params;
        console.log('Group ID:', groupId);  

        const group = await Group.findById(groupId).populate('messages');
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        res.status(200).json(group.messages); 
    } catch (error) {
        console.error('Error fetching messages:', error);  
        res.status(500).json({ message: "Error fetching messages", error });
    }
};

const sendMessage = async (req, res) => {
    try {
        const { groupId, sender, content, file } = req.body;

        
        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ message: "Group not found" });

        
        if (!group.members.includes(sender)) {
            return res.status(403).json({ message: "You are not a member of this group" });
        }

        const newMessage = new Message({
            sender,
            content,
            group: groupId,
            timestamp: new Date(),
            file: file || null
        });

        await newMessage.save();

        group.messages.push(newMessage._id);
        await group.save();

        res.status(200).json({ message: "Message sent", newMessage });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: "Error sending message", error });
    }
};

module.exports = {
    createGroup,
    getUserGroups,
    sendMessage,
    getGroupMessages
};
