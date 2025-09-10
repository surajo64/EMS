import User from "../models/User.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import Message from "../models/message.js"


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
      res.json({ success: true, token, user: {id: user._id, name: user.name, role: user.role},});
    } else {
      res.json({ success: false, message: "Invalid UserName Or Password!" });
    }



  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }

}



// Get all messages for logged-in user
 export const getAllMessage = async (req, res) => {

 try {
   const messages = await Message.find()
      .populate("userId", "name email role")    // recipient details
      .populate("createdBy", "name email role") // sender details
      .sort({ createdAt: -1 });

    res.json({ success: true, messages });
 } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

  


// Get all messages for logged-in user
  export const getMessage = async (req, res) => {
  try {
    const userId = req.userId;
    const emplMessages = await Message.find({ userId })
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
    const msg = await Message.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    res.json(msg);
  } catch (error) {
    res.status(500).json({ error: "Failed to update message" });
  }
};

// HR/Admin sends a message to an employee
  export const sendMessage = async (req, res) => {
/*  try {*/
    console.log("Incoming body:", req.body);

    const { userIds, text, title } = req.body;
   
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ success: false, message: "No recipients provided" });
    }

    const messages = await Promise.all(
      userIds.map(async (id) => {
        const msg = new Message({
          userId: id,              // ✅ fixed field name
          text,
          title,
          createdBy: req.userId._id  // ✅ sender info from token
        });
        await msg.save();
        return msg;
      })
    );

    res.json({ success: true, messages });
/*  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ success: false, message: "Error sending messages", error: err.message });
  }*/
};



// Delete Message

  export const deleteMessage = async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error deleting message" });
  }
};




export{login}