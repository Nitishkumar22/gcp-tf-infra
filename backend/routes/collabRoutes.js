const express = require('express');
const protectRoute = require('../middleware/protectRoute');
const { createCollab, deleteCollab, getAllCollabs, getUserCollabs, getCollabById } = require('../controllers/collabController');


const router = express.Router();

router.post("/create", protectRoute, createCollab);
router.delete("/delete/:id", protectRoute, deleteCollab);
// router.post("/interest/:id", protectRoute, interestedCollab);
router.get("/", protectRoute, getAllCollabs);
// router.get("/interested/:id", protectRoute, getInterestedCollabs);
router.get("/user", protectRoute, getUserCollabs);
router.get("/:id", protectRoute, getCollabById);
 
 
module.exports = router;


/* "createCollab", "deleteCollab", updateCollab, "getUserCollabs", getMyCollabs,"getAllCollabs", joinCollab(when user makes a join request),
cancelJoinCollab(deletes join request of user for that collab), 
updateJoinCollab(when user wants to update content in his join request and this join request updation facility should be available only for 15min),
getMyCollabRequests(gives all collabs for which the user who logged in made join request) */