const express = require('express');
const protectRoute = require('../middleware/protectRoute');
const {
    createRoh,
    getAllRohs,
    getUserRohs,
    getRohById,
    updateRoh,
    deleteRoh,
    addRohReview // Assuming a controller function for adding reviews
} = require('../controllers/rohController'); // Assuming controllers will be in rohController.js

const router = express.Router();

// CRUD operations for RoH items
router.post("/create", protectRoute, createRoh); // Create a new RoH item
router.get("/", protectRoute, getAllRohs); // Get all RoH items (consider adding filtering/pagination later)
router.get("/user", protectRoute, getUserRohs); // Get RoH items for the logged-in user
router.get("/:id", protectRoute, getRohById); // Get a specific RoH item by ID
router.put("/update/:id", protectRoute, updateRoh); // Update an RoH item
router.delete("/delete/:id", protectRoute, deleteRoh); // Delete an RoH item

// Review-related routes
router.post("/:id/reviews", protectRoute, addRohReview); // Add a review to an RoH item

// TODO: Consider routes for deleting/updating reviews if needed, managing review permissions.

module.exports = router;
