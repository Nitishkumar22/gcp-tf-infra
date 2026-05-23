const express = require('express');
const { getOnboardingOptions } = require('../controllers/onboardingController');

const router = express.Router();

// GET /api/onboarding/options - Get all onboarding form options
router.get('/options', getOnboardingOptions);

module.exports = router;