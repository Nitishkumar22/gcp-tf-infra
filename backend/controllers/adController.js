const Notification = require("../models/notificationModel");
const Ad = require("../models/adModel");
const User = require("../models/userModel");
const mongoose = require("mongoose");
var cloudinary = require("cloudinary").v2;

const createAd = async (req, res) => {
  try {
    let {
      productName,
      category,
      subcategory,
      description,
      price,
      currency,
      location,
      warranty,
      condition,
      shipping,
      brand,
      model,
      contactPreferences,
      tags,
    } = req.body;

    let uploadedImages  = [];

    // Parse JSON strings if needed
    if (typeof subcategory === 'string') {
      try {
        subcategory = JSON.parse(subcategory);
      } catch (e) {
        subcategory = [subcategory];
      }
    }
    
    if (typeof contactPreferences === 'string') {
      try {
        contactPreferences = JSON.parse(contactPreferences);
      } catch (e) {
        contactPreferences = [contactPreferences];
      }
    }
    
    if (typeof tags === 'string') {
      try {
        tags = JSON.parse(tags);
      } catch (e) {
        tags = tags.split(',').map(tag => tag.trim());
      }
    }

    // Handle image upload to Cloudinary
    if (req.files && req.files.length > 0) {
      for (let file of req.files) {
        try {
          const result = await cloudinary.uploader.upload(file.path, { folder: "ads" });
          uploadedImages.push({ url: result.secure_url, isPrimary: uploadedImages.length === 0 });
        } catch (error) {
          console.error("Error uploading to Cloudinary:", error);
          return res.status(500).json({ error: "Error uploading images" });
        }
      }
    }

    // Basic validation
    if (!productName || !category || !description || !price || !location) {
      return res.status(400).json({ error: "Please provide all required fields" });
    }

    // Create new ad
    const newAd = await Ad.create({
      user: req.user._id,
      productName,
      category,
      subcategory,
      description,
      price,
      currency,
      location,
      warranty,
      condition,
      shipping,
      brand,
      model,
      contactPreferences,
      tags,
      imgs: uploadedImages
    });

    // Populate user data
    const populatedAd = await Ad.findById(newAd._id).populate("user", "-password");

    res.status(201).json(populatedAd);
  } catch (error) {
    console.error("Error in createAd:", error);
    res.status(500).json({ error: "Failed to create ad" });
  }
};

const deleteAd = async (req, res) => {
  try {
    const ad = await Ad.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!ad) {
      return res.status(404).json({ error: "Ad not found or unauthorized" });
    }

    res.status(200).json({ message: "Ad deleted successfully" });
  } catch (error) {
    console.error("Error in deleteAd:", error);
    res.status(500).json({ error: "Failed to delete ad" });
  }
};

const commentOnAd = async (req, res) => {
  try {
    const { text } = req.body;
    const adId = req.params.id;
    const userId = req.user._id;

    // Validate input
    if (!text) {
      return res.status(400).json({ error: "Text field is required" });
    }

    // Find the ad by ID
    const ad = await Ad.findById(adId);
    if (!ad) {
      return res.status(404).json({ error: "Ad not found" });
    }

    // Add the comment to the ad
    const comment = { user: userId, text };
    ad.comments.push(comment);
    await ad.save();

    res.status(200).json(ad);
  } catch (error) {
    console.log("Error in commentOnAd controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const interestedAd = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id: adId } = req.params;

    // Find the ad by ID
    const ad = await Ad.findById(adId);
    if (!ad) {
      return res.status(404).json({ error: "Ad not found" });
    }

    // Check if the user has already expressed interest in the ad
    const userInterestedAd = ad.interests.includes(userId);

    if (userInterestedAd) {
      // Remove interest
      await Ad.updateOne({ _id: adId }, { $pull: { interests: userId } });
      await User.updateOne({ _id: userId }, { $pull: { interestedAds: adId } });

      const updatedInterests = ad.interests.filter((id) => id.toString() !== userId.toString());
      res.status(200).json(updatedInterests);
    } else {
      // Add interest
      ad.interests.push(userId);
      await User.updateOne({ _id: userId }, { $push: { interestedAds: adId } });
      await ad.save();

      // Create a notification for the ad owner
      try {
        const notification = new Notification({
          from: userId,
          to: ad.user,
          type: "interest",
          adId: adId
        });
        await notification.save();
      } catch (notificationError) {
        console.error("Error creating notification:", notificationError);
        // Continue even if notification fails
      }

      res.status(200).json(ad.interests);
    }
  } catch (error) {
    console.log("Error in interestedAd controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAllAds = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Extract filter parameters from query
    const { 
      category, 
      subcategory,
      minPrice, 
      maxPrice, 
      condition,
      status,
      location,
      sortBy
    } = req.query;

    // Build query object
    const query = {};

    // Apply category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    // Apply subcategory filter
    if (subcategory && subcategory !== 'all') {
      query.subcategory = { $in: [subcategory] };
    }

    // Apply price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Apply condition filter
    if (condition && condition !== 'all') {
      query.condition = condition;
    }

    // Apply status filter
    if (status && status !== 'all') {
      query.status = status;
    }

    // Apply location filter
    if (location && location !== 'all') {
      query.location = { $regex: location, $options: 'i' };
    }

    // Build sort options
    let sortOptions = { createdAt: -1 }; // Default: newest first
    
    if (sortBy === 'price-low-high') {
      sortOptions = { price: 1 };
    } else if (sortBy === 'price-high-low') {
      sortOptions = { price: -1 };
    } else if (sortBy === 'most-viewed') {
      sortOptions = { views: -1 };
    }

    console.log('Applying ad filters:', query);
    console.log('Sort options:', sortOptions);

    const ads = await Ad.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .populate("user", "-password");

    // Get total count for pagination
    const totalAds = await Ad.countDocuments(query);
    const hasMore = skip + ads.length < totalAds;

    res.status(200).json({
      ads,
      hasMore,
      nextPage: hasMore ? page + 1 : null,
    });
  } catch (error) {
    console.error("Error in getAllAds:", error);
    res.status(500).json({ error: "Failed to fetch ads" });
  }
};

const getInterestedAds = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const interestedAds = await Ad.find({ _id: { $in: user.interestedAds } })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    res.status(200).json(interestedAds);
  } catch (error) {
    console.log("Error in getInterestedAds controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get ads for the logged-in user
const getUserAds = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch ads for the user
    const ads = await Ad.find({ user: userId }).populate("user", "-password").lean();

    // Return an empty array if no ads are found
    res.status(200).json(ads || []);
  } catch (error) {
    console.error("Error in getUserAds:", error);
    res.status(500).json({ error: "Failed to fetch user's ads" });
  }
};

// Add comment route handler
const getAdComments = async (req, res) => {
  try {
    const { id } = req.params;
    
    const ad = await Ad.findById(id)
      .populate({
        path: "comments.user",
        select: "-password"
      });
      
    if (!ad) {
      return res.status(404).json({ error: "Ad not found" });
    }
    
    res.status(200).json(ad.comments);
  } catch (error) {
    console.log("Error in getAdComments controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get single ad by ID
const getAdById = async (req, res) => {
  try {
    const adId = req.params.id;

    // Validate the adId
    if (!mongoose.Types.ObjectId.isValid(adId)) {
      return res.status(400).json({ error: "Invalid ad ID" });
    }

    const ad = await Ad.findById(adId)
      .populate("user", "-password")
      .populate("interests", "-password");

    if (!ad) {
      return res.status(404).json({ error: "Ad not found" });
    }

    // Increment views
    ad.views += 1;
    await ad.save();

    res.status(200).json(ad);
  } catch (error) {
    console.error("Error in getAdById:", error);
    res.status(500).json({ error: "Failed to fetch ad" });
  }
};

// Update ad
const updateAd = async (req, res) => {
  try {
    const adId = req.params.id;
    const updates = req.body;
    
    // Ensure user owns the ad
    const ad = await Ad.findOne({ _id: adId, user: req.user._id });
    if (!ad) {
      return res.status(404).json({ error: "Ad not found or unauthorized" });
    }

    // Remove fields that shouldn't be updated
    delete updates.user;
    delete updates.views;
    delete updates.createdAt;

    const updatedAd = await Ad.findByIdAndUpdate(
      adId,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate("user", "-password");

    res.status(200).json(updatedAd);
  } catch (error) {
    console.error("Error in updateAd:", error);
    res.status(500).json({ error: "Failed to update ad" });
  }
};

// Toggle interest in ad (consolidated version)
const toggleAdInterest = async (req, res) => {
  try {
    const adId = req.params.id;
    const userId = req.user._id;

    // Find the ad
    const ad = await Ad.findById(adId);
    if (!ad) {
      return res.status(404).json({ error: "Ad not found" });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if user is already interested
    const isInterested = ad.interests.includes(userId);

    if (isInterested) {
      // Remove interest
      await Promise.all([
        Ad.findByIdAndUpdate(adId, {
          $pull: { interests: userId }
        }),
        User.findByIdAndUpdate(userId, {
          $pull: { interestedAds: adId }
        })
      ]);

      // Create notification for seller about removed interest
      await new Notification({
        type: "interest_removed",
        from: userId,
        to: ad.user,
        ad: adId
      }).save();

    } else {
      // Add interest
      await Promise.all([
        Ad.findByIdAndUpdate(adId, {
          $addToSet: { interests: userId }
        }),
        User.findByIdAndUpdate(userId, {
          $addToSet: { interestedAds: adId }
        })
      ]);

      // Create notification for seller about new interest
      await new Notification({
        type: "new_interest",
        from: userId,
        to: ad.user,
        ad: adId
      }).save();
    }

    // Return updated ad with populated fields
    const updatedAd = await Ad.findById(adId)
      .populate("user", "-password")
      .populate("interests", "-password");

    res.status(200).json(updatedAd);

  } catch (error) {
    console.error("Error in toggleAdInterest:", error);
    res.status(500).json({ error: "Failed to update interest in ad" });
  }
};

// Update ad status
const updateAdStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['available', 'pending', 'sold', 'reserved', 'expired'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const ad = await Ad.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { status },
      { new: true }
    ).populate("user", "-password");

    if (!ad) {
      return res.status(404).json({ error: "Ad not found or unauthorized" });
    }

    res.status(200).json(ad);
  } catch (error) {
    console.error("Error in updateAdStatus:", error);
    res.status(500).json({ error: "Failed to update ad status" });
  }
};

module.exports = {
  createAd,
  deleteAd,
  commentOnAd,
  getAdComments,
  interestedAd,
  getAllAds,
  getInterestedAds,
  getUserAds,
  getAdById,
  updateAd,
  toggleAdInterest,
  updateAdStatus,
};
 