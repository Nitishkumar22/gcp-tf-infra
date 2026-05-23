const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

// @desc    Send a new message
// @route   POST /api/message
// @access  Protected
const sendMessage = async (req, res) => {
  const { content, chat: chatId, attachments = [] } = req.body;

  if (!content && (!attachments || attachments.length === 0)) {
    return res.status(400).json({ message: "Message content or attachments are required" });
  }

  if (!chatId) {
    return res.status(400).json({ message: "Chat ID is required" });
  }

  try {
    // Create a new message
    let newMessage = await Message.create({
      sender: req.user._id,
      content: content || "",
      chat: chatId,
      attachments,
    });

    // Populate message with sender and chat details
    newMessage = await newMessage.populate("sender", "fullName profileImg");
    newMessage = await newMessage.populate("chat");
    newMessage = await User.populate(newMessage, {
      path: "chat.users",
      select: "fullName profileImg email",
    });

    // Update the latest message in the chat
    await Chat.findByIdAndUpdate(chatId, { latestMessage: newMessage._id });

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: "Error sending message", error: error.message });
  }
};

// @desc    Get all messages for a chat
// @route   GET /api/message/:chatId
// @access  Protected
const fetchMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    
    // Check if the chat exists
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }
    
    // Check if the user is part of the chat
    if (!chat.users.includes(req.user._id)) {
      return res.status(403).json({ message: "You are not part of this chat" });
    }

    // Get all messages for the chat
    const messages = await Message.find({ chat: chatId })
      .populate("sender", "fullName profileImg email")
      .populate("chat");

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages", error: error.message });
  }
};

// @desc    Mark a message as read
// @route   PUT /api/message/:messageId/read
// @access  Protected
const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    
    // Check if the message exists
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }
    
    // Check if the user is part of the chat
    const chat = await Chat.findById(message.chat);
    if (!chat.users.includes(req.user._id)) {
      return res.status(403).json({ message: "You are not part of this chat" });
    }
    
    // Check if the user has already read the message
    if (message.readBy.includes(req.user._id)) {
      return res.status(200).json(message);
    }
    
    // Mark the message as read
    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      { $addToSet: { readBy: req.user._id } },
      { new: true }
    )
      .populate("sender", "fullName profileImg email")
      .populate("chat")
      .populate("readBy", "fullName profileImg");

    res.status(200).json(updatedMessage);
  } catch (error) {
    res.status(500).json({ message: "Error marking message as read", error: error.message });
  }
};

module.exports = {
  sendMessage,
  fetchMessages,
  markAsRead,
};
