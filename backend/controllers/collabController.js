const Collab = require("../models/collabModel");
const Notification = require("../models/notificationModel");
const User = require("../models/userModel");
var cloudinary = require("cloudinary").v2;


// Create a new collaboration post
const createCollab = async (req, res) => {
  try {
    const { title, projectType, genres, description, isPaid, pay, timePeriod, location, requiredCraftsmen, imgs, deadline, referenceLinks } = req.body;
    const userId = req.user._id.toString();

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate required fields
    if (!title || !description || !deadline) {
      return res.status(400).json({ error: "Title, description, and deadline are required" });
    } 

    const newCollab = new Collab({
      user: userId,
      title,
      projectType,
      genres,
      description,
      isPaid, 
      pay: isPaid ? pay : undefined,
      timePeriod,
      location,
      requiredCraftsmen,
      imgs,
      deadline,
      referenceLinks,
    });

    let imgUrls = [];
    console.log("Uploading images to Cloudinary...");
    if (imgs) {
      for (const img of imgs) {
        try {
          const uploadedResponse = await cloudinary.uploader.upload(img, {
            folder: "collabs",
          });
          console.log("Cloudinary upload successful:", uploadedResponse);
          imgUrls.push(uploadedResponse.secure_url);
        } catch (uploadError) {
          console.error("Error uploading to Cloudinary:", uploadError);
          return res.status(500).json({ error: "Error uploading images" });
        }
      }
    }

    await newCollab.save();
    res.status(201).json(newCollab);
  } catch (error) {
    console.error("Error creating collaboration:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete a Collab post
const deleteCollab = async (req, res) => {
  try {
    const collab = await collab.findById(req.params.id);
    if (!collab) {
      return res.status(404).json({ error: "Collaboration Post not found" });
    }

    if (collab.user.toString()!== req.user._id.toString()) {
      return res.status(401).json({ error: "You are not authorized to delete this collaboration post" });
    }

		// Loop through the imgs array and delete each image from Cloudinary
		if (collab.imgs && collab.imgs.length > 0) {
			console.log("Deleting images from Cloudinary...");
			for (const img of collab.imgs) {
				try {
					const imgId = img.split("/").pop().split(".")[0];
					await cloudinary.uploader.destroy(imgId);
					console.log(`Deleted image ${imgId} from Cloudinary`);
				} catch (cloudinaryError) {
					console.error("Error deleting image from Cloudinary:", cloudinaryError);
					return res.status(500).json({ error: "Error deleting images from Cloudinary" });
				}
			}
		}

    await Collab.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Collaboration post deleted successfully" });
  } catch (error) {
    console.log("Error in deleteCollab controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

const getAllCollabs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Extract filter parameters from query
    const { 
      projectType, 
      genre, 
      paymentStatus,
      location, 
      requiredRole, 
      sortBy 
    } = req.query;

    // Build query object
    const query = {};

    // Apply project type filter
    if (projectType && projectType !== 'all') {
      query.projectType = projectType;
    }

    // Apply genre filter
    if (genre && genre !== 'all') {
      query.genres = { $in: [genre] };
    }

    // Apply payment status filter
    if (paymentStatus && paymentStatus !== 'all') {
      query.isPaid = paymentStatus === 'paid';
    }

    // Apply location filter
    if (location && location !== 'all') {
      query.location = { $regex: location, $options: 'i' };
    }

    // Apply required role filter
    if (requiredRole && requiredRole !== 'all') {
      query.requiredCraftsmen = { $in: [requiredRole] };
    }

    // Build sort options
    let sortOptions = { createdAt: -1 }; // Default: newest first
    
    if (sortBy === 'deadline-soon') {
      sortOptions = { deadline: 1 };
    } else if (sortBy === 'most-popular') {
      // For popularity, we could use the number of join requests
      sortOptions = { 'joinRequests.length': -1 };
    }

    console.log('Applying filters:', query);
    console.log('Sort options:', sortOptions);

    const collabs = await Collab.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .populate({
        path: "user",
        select: "-password",
      });

    const totalCollabs = await Collab.countDocuments(query);
    const hasMore = skip + collabs.length < totalCollabs;

    res.status(200).json({
      collabs,
      hasMore,
      nextPage: hasMore ? page + 1 : null,
    });
  } catch (error) {
    console.log("Error in getAllCollabs controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getUserCollabs = async (req, res) => {
  try {
    const userId = req.user._id;
    const collabs = await Collab.find({ user: userId })
      .sort({ createdAt: -1 })
      .select("title description projectType createdAt")
      .lean();

    res.status(200).json(collabs);
  } catch (error) {
    console.error("Error fetching user collabs:", error);
    res.status(500).json({ error: "Failed to fetch user collaborations" });
  }
};

// Get a single Collab post by ID
const getCollabById = async (req, res) => {
  try {
    const collab = await Collab.findById(req.params.id).populate("user", "-password");
    if (!collab) {
      return res.status(404).json({ error: "Collaboration Post not found" });
    }
    res.status(200).json(collab);
  } catch (error) {
    console.error("Error fetching collaboration:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { createCollab, deleteCollab, getAllCollabs, getUserCollabs, getCollabById };
