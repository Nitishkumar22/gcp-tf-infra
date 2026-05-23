const express = require("express");
const protectRoute = require("../middleware/protectRoute");
const {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
  fetchSingleChat,
  deleteChat
} = require("../controllers/chatController");

const router = express.Router();

// Route to access or create a one-on-one chat
router.post("/", protectRoute, accessChat);

// Route to get all chats for a user
router.get("/", protectRoute, fetchChats);

// Route to get a specific chat
router.get("/:chatId", protectRoute, fetchSingleChat);

// Route to create a group chat
router.post("/group", protectRoute, createGroupChat);

// Route to rename a group
router.put("/group/rename", protectRoute, renameGroup);

// Route to add users to a group
router.put("/group/add", protectRoute, addToGroup);

// Route to remove users from a group
router.put("/group/remove", protectRoute, removeFromGroup);

// Route to delete a chat
router.delete("/:chatId", protectRoute, deleteChat);

module.exports = router;