const generateTokenAndSetCookie = require('../lib/utils/generateToken.js');
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
var cloudinary = require('cloudinary').v2;


const signup = async (req, res) => {
	try { 
		const { email, password } = req.body;

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return res.status(400).json({ error: "Invalid email format" });
		}

		const existingEmail = await User.findOne({ email });
		if (existingEmail) {
			return res.status(400).json({ error: "Email is already taken" });
		}

		if (password.length < 6) {
			return res.status(400).json({ error: "Password must be at least 6 characters long" });
		}

		// Generate unique username from email
		const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
		let username = baseUsername;
		let counter = 1;

		// Check if username exists and increment counter if needed
		while (await User.findOne({ username })) {
			username = `${baseUsername}${counter}`;
			counter++;
		}

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		const newUser = new User({
			email,
			username, // Add the generated username
			password: hashedPassword,
		}); 

		if (newUser) {
			generateTokenAndSetCookie(newUser._id, res);
			await newUser.save();

			res.status(201).json({
				_id: newUser._id,
				email: newUser.email,
				username: newUser.username, // Include username in response
			});
		} else {
			res.status(400).json({ error: "Invalid user data" });
		}
	} catch (error) {
		console.log("Error in signup controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};


const login = async (req, res) => {
	const startTime = performance.now();
	try {
			const { username, password } = req.body;
			
			// Validate input
			if (!username || !password) {
					return res.status(400).json({ error: "Username and password are required" });
			}

			// Use lean() for better performance and select only needed fields
			const user = await User.findOne({ username })
					.select('password fullName username email followers following profileImg coverImg')
					.lean();

			if (!user) {
					return res.status(400).json({ error: "Invalid username or password" });
			}

			const isPasswordCorrect = await bcrypt.compare(password, user.password);
			if (!isPasswordCorrect) {
					return res.status(400).json({ error: "Invalid username or password" });
			}

			// Remove password from user object
			delete user.password;

			console.log('Generating token for user:', user._id);
			generateTokenAndSetCookie(user._id, res);
			console.log('Token generated and cookie should be set');
			
			// Log response headers
			console.log('Response headers:', res.getHeaders());

			console.log(`Login completed in ${performance.now() - startTime}ms`);
			return res.status(200).json(user);
	} catch (error) {
			console.error("Login error:", error);
			return res.status(500).json({ error: "Internal Server Error" });
	}
};

 
const logout = async (req, res) => {
    try {
        // Clear the JWT cookie
        res.cookie("jwt", "", {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            expires: new Date(0),
            path: '/'
        });

        res.status(200).json({ 
            message: "Logged out successfully",
            isAuthenticated: false 
        });
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ 
            error: "Internal Server Error",
            isAuthenticated: true 
        });
    }
};

const getMe = async (req, res) => {
    try {
		const user = await User.findById(req.user._id).select("-password");
		res.status(200).json(user);
	} catch (error) {
		console.log("Error in getMe controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
}

const onboardingSubmit = async (req, res) => {
	try {
			const {
					fullName,
					username,
					email,
					password,
					bio,
					link,
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
					profileImg,
					coverImg
			} = req.body;

      // Add validation for required fields
      if (!fullName || !username || !email || !password) {
        return res.status(400).json({ error: "Full name, username, email, and password are required" });
      }

      // Add validation for empty strings
      if (fullName.trim() === "" || username.trim() === "" || email.trim() === "" || password.trim() === "") {
          return res.status(400).json({ error: "Full name, username, email, and password cannot be empty" });
      }

			const userId = req.user._id;
			const user = await User.findById(userId);

			if (!user) {
					return res.status(404).json({ error: "User not found" });
			}

			let profileImgUrl = user.profileImg;
			let coverImgUrl = user.coverImg;

			// Upload Profile Image if provided
			if (profileImg) {
					console.log('Uploading new profile image...');
					if (user.profileImg) {
							await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
					}
					const uploadedResponse = await cloudinary.uploader.upload(profileImg,{
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
					profileImgUrl = uploadedResponse.secure_url;
			}

			// Upload Cover Image if provided
			if (coverImg) {
					console.log('Uploading new cover image...');
					if (user.coverImg) {
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
					coverImgUrl = uploadedResponse.secure_url;
			}

      // Check if username or email already exists (excluding the current user)
      const existingUserByUsername = await User.findOne({ username, _id: { $ne: userId } });
      if (existingUserByUsername) {
          return res.status(400).json({ error: "Username is already taken" });
      }

      const existingUserByEmail = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUserByEmail) {
          return res.status(400).json({ error: "Email is already taken" });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      // Validate password length
      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters long" });
      }

			const salt = await bcrypt.genSalt(10);
			const hashedPassword = await bcrypt.hash(password, salt);

			// Update user fields
			user.fullName = fullName;
			user.username = username;
			user.email = email;
			user.password = hashedPassword; // Ensure password is hashed before saving
			user.profileImg = profileImgUrl;
			user.coverImg = coverImgUrl;
			user.bio = bio;
			user.link = link;
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
			user.onboardingCompleted = true;

			await user.save();
      // Fetch the latest user data
			const updatedUser = await User.findById(user._id).select("username");

			res.status(200).json({ message: "Onboarding completed successfully", username: updatedUser.username });
	} catch (error) {
			console.error("Error in onboardingSubmit controller:", error);
			res.status(500).json({ error: "Internal Server Error" });
	}
};


module.exports = { signup, login, logout, getMe, onboardingSubmit };