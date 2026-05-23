const Chat = require("../models/chatModel");
const User = require("../models/userModel");

// @desc    Create or access a one-on-one chat
// @route   POST /api/chat
// @access  Protected
const accessChat = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "UserId param not sent with request" });
  }

  try {
    // Find if a chat already exists between the two users
    let chat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage");

    // Populate the sender details in the latest message
    chat = await User.populate(chat, {
      path: "latestMessage.sender",
      select: "fullName profileImg email",
    });

    // If chat exists, return it
    if (chat.length > 0) {
      res.status(200).json(chat[0]);
    } else {
      // Create a new chat
      const newChat = await Chat.create({
        chatName: "sender",
        isGroupChat: false,
        users: [req.user._id, userId],
      });

      const fullChat = await Chat.findOne({ _id: newChat._id }).populate(
        "users",
        "-password"
      );

      res.status(201).json(fullChat);
    }
  } catch (error) {
    res.status(500).json({ message: "Error accessing chat", error: error.message });
  }
};

// @desc    Fetch all chats for a user
// @route   GET /api/chat
// @access  Protected
const fetchChats = async (req, res) => {
  try {
    // Find all chats that the user is part of
    let chats = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    // Populate the sender details in the latest message
    chats = await User.populate(chats, {
      path: "latestMessage.sender",
      select: "fullName profileImg email",
    });

    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ message: "Error fetching chats", error: error.message });
  }
};

// @desc    Fetch a single chat
// @route   GET /api/chat/:chatId
// @access  Protected
const fetchSingleChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId)
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage");

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Check if the user is part of the chat
    if (!chat.users.some(user => user._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: "You are not part of this chat" });
    }

    // Populate the sender details in the latest message
    const populatedChat = await User.populate(chat, {
      path: "latestMessage.sender",
      select: "fullName profileImg email",
    });

    res.status(200).json(populatedChat);
  } catch (error) {
    res.status(500).json({ message: "Error fetching chat", error: error.message });
  }
};

// @desc    Create a group chat
// @route   POST /api/chat/group
// @access  Protected
const createGroupChat = async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).json({ message: "Please fill all the fields" });
  }

  let users = req.body.users;

  // If users is a string (JSON), parse it
  if (typeof users === "string") {
    users = JSON.parse(users);
  }

  // Add the current user to the group
  users.push(req.user._id);

  // Group should have at least 3 users (including the creator)
  if (users.length < 2) {
    return res.status(400).json({ message: "A group chat needs at least 2 users" });
  }

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      isGroupChat: true,
      users: users,
      groupAdmin: req.user._id,
      groupImage: req.body.groupImage || "",
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(201).json(fullGroupChat);
  } catch (error) {
    res.status(500).json({ message: "Error creating group chat", error: error.message });
  }
};

// @desc    Rename a group
// @route   PUT /api/chat/group/rename
// @access  Protected
const renameGroup = async (req, res) => {
  const { chatId, chatName } = req.body;

  if (!chatId || !chatName) {
    return res.status(400).json({ message: "Please provide both chatId and chatName" });
  }

  try {
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { chatName },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!updatedChat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Check if the user is the admin of the group
    if (updatedChat.groupAdmin._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only admin can rename the group" });
    }

    res.status(200).json(updatedChat);
  } catch (error) {
    res.status(500).json({ message: "Error renaming group", error: error.message });
  }
};

// @desc    Add users to a group
// @route   PUT /api/chat/group/add
// @access  Protected
const addToGroup = async (req, res) => {
  const { chatId, users } = req.body;

  if (!chatId || !users) {
    return res.status(400).json({ message: "Please provide both chatId and users" });
  }

  try {
    // First check if the chat exists and the requester is the admin
    const chat = await Chat.findById(chatId);
    
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }
    
    if (chat.groupAdmin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only admin can add users to the group" });
    }

    // Parse users if it's a string
    let userIds = users;
    if (typeof users === "string") {
      userIds = JSON.parse(users);
    }

    // Add users to the group
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { $addToSet: { users: { $each: userIds } } },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(updatedChat);
  } catch (error) {
    res.status(500).json({ message: "Error adding users to group", error: error.message });
  }
};

// @desc    Remove a user from a group
// @route   PUT /api/chat/group/remove
// @access  Protected
const removeFromGroup = async (req, res) => {
  const { chatId, userId } = req.body;

  if (!chatId || !userId) {
    return res.status(400).json({ message: "Please provide both chatId and userId" });
  }

  try {
    // First check if the chat exists
    const chat = await Chat.findById(chatId);
    
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }
    
    // Check if the requester is the admin or removing themselves
    if (chat.groupAdmin.toString() !== req.user._id.toString() && 
        userId !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only admin can remove other users from the group" });
    }

    // Admin cannot be removed from the group
    if (userId === chat.groupAdmin.toString()) {
      return res.status(400).json({ message: "Admin cannot be removed from the group" });
    }

    // Remove the user from the group
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { $pull: { users: userId } },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(updatedChat);
  } catch (error) {
    res.status(500).json({ message: "Error removing user from group", error: error.message });
  }
};

// @desc    Delete a chat
// @route   DELETE /api/chat/:chatId
// @access  Protected
const deleteChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }
    
    // Check if the user is part of the chat
    if (!chat.users.includes(req.user._id)) {
      return res.status(403).json({ message: "You are not part of this chat" });
    }
    
    // For group chats, only admin can delete
    if (chat.isGroupChat && chat.groupAdmin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only admin can delete the group chat" });
    }
    
    await Chat.findByIdAndDelete(req.params.chatId);
    
    res.status(200).json({ message: "Chat deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting chat", error: error.message });
  }
};

module.exports = {
  accessChat,
  fetchChats,
  fetchSingleChat,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
  deleteChat,
};
