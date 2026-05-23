const User = require('../models/userModel');
const Notification = require('../models/notificationModel');
const bcrypt = require('bcryptjs');
var cloudinary = require('cloudinary').v2;

const getUserProfile = async (req, res) => {
	const { username } = req.params;

	try {
		const user = await User.findOne({ username }).select("-password");
		if (!user) return res.status(404).json({ message: "User not found" });

		res.status(200).json(user);
	} catch (error) {
		console.log("Error in getUserProfile: ", error.message);
		res.status(500).json({ error: error.message });
	}
};

const followUnfollowUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userToModify = await User.findById(id);
        const currentUser = await User.findById(req.user._id);

        if (id === req.user._id.toString()) {
            return res.status(400).json({ message: "You cannot follow/unfollow yourself" });
        }

        if (!userToModify || !currentUser) return res.status(400).json({ error: "User does not found" });

        const isFollowing = currentUser.following.includes(id);
        if (isFollowing) {
            await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
            await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });

            // Send notification for unfollow
            const unfollowNotification = new Notification({
                type: "unfollow",
                from: req.user._id,
                to: userToModify._id,
            });
            await unfollowNotification.save();

            res.status(200).json({ message: "User Unfollowed successfully" });
        } else {
            await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
            await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });

            // Send notification for follow
            const followNotification = new Notification({
                type: "follow",
                from: req.user._id,
                to: userToModify._id,
            });
            await followNotification.save();

            res.status(200).json({ message: "User followed successfully" });
        }
    } catch (error) {
        console.log("Error in followUnfollowUser: ", error.message);
        res.status(500).json({ error: error.message });
    }
};

const getSuggestedUsers = async (req, res) => {
    try {
        const userId = req.user._id;

        const usersFollowedByMe = await User.findById(userId).select("following");

        const users = await User.aggregate([
            {
                $match: {
                    _id: {$ne: userId}
                }
            },
            {$sample: {size:10}}
        ])
        
        const filteredUsers = users.filter(user => !usersFollowedByMe.following.includes(user._id))
        const suggestedUsers = filteredUsers

        suggestedUsers.forEach(user => user.password=null)

        res.status(200).json(suggestedUsers);

    } catch (error) {
        console.log("Error in getSuggestedUsers: ", error.message);
        res.status(500).json({ error: error.message });
    }
}

const updateUser = async (req, res) => {
    const {fullName, email, username, currentPassword, newPassword, bio, link,
        profession,
        skills,
        experienceLevel,
        genres,
        location,
        availableForCollaboration,
        interests,
        preferredCollabTypes,
        pastProjects,
        equipmentOwned,
    } = req.body;
    let {profileImg, coverImg} = req.body;

    const userId = req.user._id;

    try {
        let user = await User.findById(userId);
        if(!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if((!newPassword && currentPassword) || (!currentPassword && newPassword)) {
            return res.status(400).json({ message: "Please enter both current and new password" });
        }
        if(currentPassword && newPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password)
            if(!isMatch) {
                return res.status(400).json({ message: "Current password is incorrect" });
            }
            if(newPassword.length < 6) {
                return res.status(400).json({ message: "New password should be atleast 6 characters long" });
            }
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        if(profileImg) {
            console.log('Uploading new profile image');
            if(user.profileImg){
                await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
            }
            const uploadedResponse = await cloudinary.uploader.upload(profileImg, {
                folder: "profileimg",
                height: 200,
                width: 200,
                crop: "fill",
                transformation: [
                    { width: 500, crop: "scale" },
                    { quality: 'auto:best' },
                    { fetch_format: "auto" }
                ]
            }); 
            profileImg = uploadedResponse.secure_url;
        }
        if(coverImg) { 
            if(user.coverImg){
                await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
            }
            const uploadedResponse = await cloudinary.uploader.upload(coverImg,{
                folder: "coverimg",
                height: 200,
                width: 200,
                crop: "fill",
                transformation: [
                    { width: 500, crop: "scale" },
                    { quality: 'auto:best' },
                    { fetch_format: "auto" }
                ]
            }); 
            coverImg = uploadedResponse.secure_url;
        }

        user.fullName = fullName || user.fullName;
        user.email = email || user.email;
        user.username = username || user.username;
        user.bio = bio || user.bio;
        user.link = link || user.link;
        user.profileImg = profileImg || user.profileImg;
        user.coverImg = coverImg || user.coverImg;
        user.profession = profession;
        user.skills = skills;
        user.experienceLevel = experienceLevel;
        user.genres = genres;
        user.location = location;
        user.availableForCollaboration = availableForCollaboration;
        user.interests = interests;
        user.preferredCollabTypes = preferredCollabTypes;
        user.pastProjects = pastProjects;
        user.equipmentOwned = equipmentOwned;
        user.onboardingCompleted = true; // Mark onboarding as completed
 
        user = await user.save();

        user.password =  null;

        return res.status(200).json(user);

    } catch (error) {
        console.log("Error in updateUser:", error.message)
        res.status(500).json({ error: error.message });
    }
}

module.exports = { getUserProfile, followUnfollowUser, getSuggestedUsers, updateUser };