const express = require('express');
const router = express.Router();
const protectRoute = require('../middleware/protectRoute');
const {
  getFilterOptions,
  getFilterOptionsForType,
  filterPosts,
  filterAds,
  filterRohs,
  filterCollabs
} = require('../controllers/filterController');

// Get all filter options
router.get('/options', getFilterOptions);

// Get filter options for a specific content type (posts, ads, rohs, collabs)
router.get('/options/:type', getFilterOptionsForType);

// Apply filters to different content types
router.get('/posts', protectRoute, filterPosts);
router.get('/ads', protectRoute, filterAds);
router.get('/rohs', protectRoute, filterRohs);
router.get('/collabs', protectRoute, filterCollabs);

module.exports = router;
