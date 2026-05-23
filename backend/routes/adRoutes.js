const express = require('express');
const protectRoute = require('../middleware/protectRoute');
const {
  createAd,
  getAllAds,
  getAdById,
  getUserAds,
  updateAd,
  deleteAd,
  toggleAdInterest,
  updateAdStatus,
} = require('../controllers/adController');

const router = express.Router();

// Public routes
router.get('/user', protectRoute, getUserAds);
router.get('/:id', getAdById);

// Protected routes
router.get('/', protectRoute, getAllAds);
router.post('/create', protectRoute, createAd);
router.put('/edit/:id', protectRoute, updateAd);
router.delete('/delete/:id', protectRoute, deleteAd);
router.post('/:id/toggle-interest', protectRoute, toggleAdInterest);
router.put('/:id/status', protectRoute, updateAdStatus);

module.exports = router; 