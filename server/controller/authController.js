import User from "../models/User.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import Message from "../models/message.js"
import { io } from "../index.js";
import mongoose from "mongoose";


const login = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })

    if (!user) {
      return res.json({ success: false, message: "User Does not Exist" })
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if (isMatch) {
      const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET,)
      res.json({ success: true, token, user: { id: user._id, name: user.name, role: user.role }, });
    } else {
      res.json({ success: false, message: "Invalid UserName Or Password!" });
    }

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }

}


//sends a message to an employee
export const sendMessage = async (req, res) => {
  try {
    const { userIds, text, title } = req.body;
    const senderId = req.userId;

    // Convert string IDs to ObjectId
    const recipientIds = userIds.map(id => new mongoose.Types.ObjectId(id));
    const senderObjectId = new mongoose.Types.ObjectId(senderId);

    // ✅ Create message
    const message = new Message({
      title,
      text,
      recipients: recipientIds, // Use converted ObjectIds
      createdBy: senderObjectId,
      isRead: [
        { userId: senderObjectId, read: true }, // Mark sender as read
        ...recipientIds.map(uid => ({ userId: uid, read: false })) // Recipients as unread
      ]
    });

    await message.save();

    // ✅ Populate recipients and sender before sending response
    const savedMessage = await Message.findById(message._id)
      .populate("recipients", "name email role")
      .populate("createdBy", "name email role");

    res.json({ success: true, message: savedMessage });
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ success: false, message: "Failed to send message" });
  }
};



// Get all messages for logged-in user (sent or received)
export const getAllMessage = async (req, res) => {
  try {
    const userId = req.userId;
    
    

    // ✅ Fetch messages where user is sender or recipient
    const messages = await Message.find({
      $or: [
        { createdBy: userId },
        { recipients: userId }
      ],
    })
      .populate("recipients", "name email role")
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    res.json({ success: true, messages });
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ success: false, message: "Failed to fetch messages" });
  }
};

// Get all messages for logged-in user (only received)
export const getMessage = async (req, res) => {
  try {
    const userId = req.userId;

    const emplMessages = await Message.find({
      recipients: userId // ✅ only messages where I'm in recipients
    })
      .populate("recipients", "name email role")
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    res.json({ success: true, emplMessages });
  } catch (error) {
    console.error("Error fetching my messages:", error);
    res.status(500).json({ success: false, message: "Failed to fetch messages" });
  }
};



// Mark a message as read


export const markRead = async (req, res) => {
  try {
    const { messageId } = req.params; // ✅ match route param
    const userId = req.userId;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    // find entry for this user
    const entry = message.isRead.find(
      (r) => r.userId.toString() === userId.toString()
    );

    if (entry) {
      entry.read = true;
    } else {
      message.isRead.push({ userId, read: true });
    }

    await message.save();

    // ✅ Emit real-time update to this user
    io.to(userId.toString()).emit("messageRead", {
      messageId: message._id,
      userId,
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error marking read:", error);
    res.status(500).json({ success: false, message: "Failed to mark as read" });
  }
};


// Delete Message (only remove user from recipients, never delete entire message)
export const deleteMessage = async (req, res) => {
  try {
    const messageId = req.params.id;
    const userId = req.userId;

    // Always just remove the user from recipients, never delete the message
    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      {
        $pull: {
          recipients: userId,
          isRead: { userId: userId }
        }
      },
      { new: true }
    )
      .populate("recipients", "name email role")
      .populate("createdBy", "name email role");

    if (!updatedMessage) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    res.json({ 
      success: true, 
      message: "User removed from recipients",
      updatedMessage 
    });
  } catch (err) {
    console.error("Error updating message:", err);
    res.status(500).json({ success: false, message: "Error updating message" });
  }
};


// Reply to message
export const replyToMessage = async (req, res) => {
  try {
    const { message, replyToAll } = req.body;
    const messageId = req.params.id;
    const userId = req.userId;

    // Find the message
    const originalMessage = await Message.findById(messageId);
    if (!originalMessage) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    // Add the reply
    const reply = {
      userId: userId,
      message: message
    };

    // Update the message with the new reply
    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      { $push: { replies: reply } },
      { new: true }
    )
      .populate("recipients", "name email role")
      .populate("createdBy", "name email role")
      .populate("replies.userId", "name email");

    // Here you could also send notifications to recipients
    // based on the replyToAll flag

    res.json({ 
      success: true, 
      message: "Reply sent successfully",
      updatedMessage 
    });
  } catch (err) {
    console.error("Error replying to message:", err);
    res.status(500).json({ success: false, message: "Failed to send reply" });
  }
};




export { login }