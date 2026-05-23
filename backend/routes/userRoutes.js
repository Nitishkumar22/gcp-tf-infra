const express = require('express');
const protectRoute = require('../middleware/protectRoute');
const { getUserProfile, followUnfollowUser, getSuggestedUsers, updateUser } = require('../controllers/userController');
const User = require('../models/userModel');

const router = express.Router();

router.get("/profile/:username", protectRoute, getUserProfile);
router.post("/follow/:id", protectRoute , followUnfollowUser);
router.get("/suggestedusers", protectRoute, getSuggestedUsers);
router.post("/update", protectRoute , updateUser);

// Check username availability, allowing current user to keep their username
router.get("/check-username", protectRoute, async (req, res) => {
  try {
    const { username } = req.query;

    if (!username || username.length < 3) {
      return res.status(400).json({ error: "Username must be at least 3 characters long" });
    }

    // Find if any user has this username
    const existingUser = await User.findOne({ username });
    let available = true;
    if (existingUser) {
      // If the found user is not the current user, it's taken
      if (existingUser._id.toString() !== req.user._id.toString()) {
        available = false;
      }
    }
    return res.status(200).json({ available });
  } catch (error) {
    console.error("Error checking username availability:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
 