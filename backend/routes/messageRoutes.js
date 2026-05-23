const express = require("express");
const protectRoute = require("../middleware/protectRoute");
const {
  sendMessage,
  fetchMessages,
  markAsRead
} = require("../controllers/messageController");

const router = express.Router();

// Route to send a message
router.post("/", protectRoute, sendMessage);

// Route to get all messages for a chat
router.get("/:chatId", protectRoute, fetchMessages);

// Route to mark messages as read
router.put("/:messageId/read", protectRoute, markAsRead);

module.exports = router;