const Roh = require('../models/RohModel');
const Notification = require('../models/notificationModel'); // Optional: notify on review
var cloudinary = require("cloudinary").v2;

// Utility: consistent error response
const sendError = (res, status, message, error = null) => {
  console.error(`Error: ${message}`, error || ''); // Log the error details server-side
  return res.status(status).json({ success: false, message });
};

// Upload images - Throws error on failure
const uploadImagesToCloudinary = async (imgs) => {
  console.log("Attempting to upload images to Cloudinary...");
  let imgUrls = [];
  if (imgs && imgs.length > 0) {
    for (const img of imgs) {
      // If any upload fails, the error will propagate up and be caught by the calling function
      const uploadedResponse = await cloudinary.uploader.upload(img, {
        folder: "rohs",
      });
      console.log(`Successfully uploaded image, URL: ${uploadedResponse.secure_url}`);
      imgUrls.push(uploadedResponse.secure_url);
    }
  }
  console.log(`Finished uploading ${imgUrls.length} images.`);
  return imgUrls;
};

// Delete images - Logs errors but continues
const deleteImagesFromCloudinary = async (imgs) => {
  console.log("Attempting to delete images from Cloudinary...");
  let deletedCount = 0;
  if (imgs && imgs.length > 0) {
    for (const img of imgs) {
      try {
        const publicId = img.split("/").slice(-2).join("/").split(".")[0]; // safer path
        console.log(`Attempting to delete Cloudinary image with publicId: ${publicId}`);
        await cloudinary.uploader.destroy(publicId);
        console.log(`Successfully deleted image: ${publicId}`);
        deletedCount++;
      } catch (deleteError) {
        // Log the specific error but allow the loop to continue
        console.error(`Failed to delete image ${img} from Cloudinary:`, deleteError);
      }
    }
  }
  console.log(`Finished deleting images. Attempted: ${imgs?.length || 0}, Successful: ${deletedCount}`);
};

// Create
const createRoh = async (req, res) => {
  console.log("--- createRoh Request Received ---");
  console.log("Request Body:", req.body); // Be mindful of logging sensitive data like base64 imgs in production

  try {
    const {
      productName, description, category, department, isForHelp, rentPrice,
      isNegotiable, location, availability, status, visibility, postExpiresAt, imgs
    } = req.body;
    const userId = req.user._id; // Get user ID from protectRoute middleware

    // Basic synchronous validation
    const errors = [];
    if (!productName) errors.push({ field: "productName", message: "Product name is required" });
    if (!description) errors.push({ field: "description", message: "Description is required" });
    if (!category) errors.push({ field: "category", message: "Category is required" });
    if (!department) errors.push({ field: "department", message: "Department is required" });
    if (typeof isForHelp !== 'boolean') errors.push({ field: "isForHelp", message: "isForHelp must be true or false" });
    if (!isForHelp && (rentPrice === undefined || rentPrice === null)) {
      errors.push({ field: "rentPrice", message: "Rent price is required for rental posts" });
    }
    if (isForHelp && rentPrice !== undefined && rentPrice !== null) {
      errors.push({ field: "rentPrice", message: "Rent price must not be provided for help posts" });
    }

    if (errors.length > 0) {
      console.log("Validation errors:", errors);
      return res.status(400).json({ success: false, errors });
    }

    console.log("Uploading images for new RoH item...");
    const uploadedImgUrls = await uploadImagesToCloudinary(imgs); // Error will be caught below if upload fails
    console.log("Image upload successful, URLs:", uploadedImgUrls);

    const roh = new Roh({
      user: userId,
      productName,
      description,
      category,
      department,
      isForHelp,
      rentPrice: isForHelp ? undefined : rentPrice,
      isNegotiable: isNegotiable || false,
      location,
      availability,
      status,
      visibility,
      postExpiresAt,
      imgs: uploadedImgUrls,
    });

    console.log("Saving new RoH item to database...");
    await roh.save(); // Mongoose validation runs here
    console.log("RoH item saved successfully:", roh._id);
    res.status(201).json({ success: true, data: roh });

  } catch (err) {
    if (err.name === 'ValidationError') {
        console.error("Mongoose Validation Error:", err.message);
        return sendError(res, 400, "Validation failed", err.errors);
    }
     // Check if it's a Cloudinary upload error potentially wrapped
    if (err.message && err.message.includes("Cloudinary")) {
        return sendError(res, 500, "Image upload failed", err);
    }
    return sendError(res, 500, "Internal server error during RoH creation", err);
  }
};

// Get All with filters + pagination
const getAllRohs = async (req, res) => {
  console.log("--- getAllRohs Request Received ---");
  console.log("Request Query:", req.query);
  try {
    const { 
      category, 
      department,
      type, // for-rent or for-help
      status, 
      location, 
      minPrice,
      maxPrice,
      rating,
      sortBy,
      page = 1, 
      limit = 10 
    } = req.query;
    
    // Build query object
    const query = {};

    // Apply category filter
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Apply department filter
    if (department && department !== 'all') {
      query.department = department;
    }

    // Apply type filter (for-rent or for-help)
    if (type === 'for-rent') {
      query.isForHelp = false;
    } else if (type === 'for-help') {
      query.isForHelp = true;
    }
    
    // Apply status filter
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Apply location filter
    if (location && location !== 'all') {
      query.location = { $regex: location, $options: 'i' }; // Case-insensitive search
    }
    
    // Apply price range filter (for rentals)
    if (type !== 'for-help' && (minPrice || maxPrice)) {
      query.rentPrice = {};
      if (minPrice) query.rentPrice.$gte = Number(minPrice);
      if (maxPrice) query.rentPrice.$lte = Number(maxPrice);
    }
    
    // Apply rating filter
    if (rating && rating !== 'all') {
      query.averageRating = { $gte: Number(rating) };
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build sort options
    let sortOptions = { createdAt: -1 }; // Default: newest first
    
    if (sortBy === 'price-low-high') {
      sortOptions = { rentPrice: 1 };
    } else if (sortBy === 'price-high-low') {
      sortOptions = { rentPrice: -1 };
    } else if (sortBy === 'highest-rated') {
      sortOptions = { averageRating: -1 };
    }

    console.log("Applying filters:", query);
    console.log("Sort options:", sortOptions);
    console.log(`Fetching RoH items page ${pageNum}, limit ${limitNum}`);

    const rohs = await Roh.find(query)
      .populate("user", "username profileImg")
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    const total = await Roh.countDocuments(query);
    const hasMore = skip + rohs.length < total;

    console.log(`Found ${rohs.length} items, Total matching: ${total}, HasMore: ${hasMore}`);
    res.status(200).json({ 
      success: true, 
      data: rohs, 
      hasMore, 
      nextPage: hasMore ? pageNum + 1 : null 
    });

  } catch (err) {
    return sendError(res, 500, "Failed to fetch RoH items", err);
  }
};

// Get by ID
const getRohById = async (req, res) => {
  console.log(`--- getRohById Request Received for ID: ${req.params.id} ---`);
  try {
    const roh = await Roh.findById(req.params.id)
      .populate("user", "username profileImg fullName")
      .populate("reviews.user", "username profileImg");

    if (!roh) {
      console.log(`RoH item not found for ID: ${req.params.id}`);
      return sendError(res, 404, "RoH item not found");
    }

    console.log(`RoH item found: ${roh._id}`);
    res.status(200).json({ success: true, data: roh });

  } catch (err) {
    if (err.kind === 'ObjectId') {
        console.log(`Invalid ID format received: ${req.params.id}`);
        return sendError(res, 400, "Invalid ID format");
    }
    return sendError(res, 500, "Failed to fetch RoH item by ID", err);
  }
};

// Get user items
const getUserRohs = async (req, res) => {
   const userId = req.user._id;
  console.log(`--- getUserRohs Request Received for User ID: ${userId} ---`);
  try {
    const items = await Roh.find({ user: userId }).sort({ createdAt: -1 });
    console.log(`Found ${items.length} RoH items for user ${userId}`);
    res.status(200).json({ success: true, data: items });
  } catch (err) {
    return sendError(res, 500, "Failed to fetch your RoH items", err);
  }
};

// Update
const updateRoh = async (req, res) => {
  const { id } = req.params;
  console.log(`--- updateRoh Request Received for ID: ${id} ---`);
  console.log("Request Body:", req.body); // Be careful logging sensitive data

  try {
    const updateData = req.body;
    const userId = req.user._id;

    const roh = await Roh.findById(id);
    if (!roh) {
        console.log(`RoH item not found for update, ID: ${id}`);
        return sendError(res, 404, "RoH item not found");
    }
    if (roh.user.toString() !== userId.toString()) {
      console.warn(`Unauthorized update attempt by User ${userId} on RoH item ${id} owned by ${roh.user}`);
      return sendError(res, 403, "Unauthorized to update this item");
    }

    // Handle images
    if (updateData.imgsToRemove && updateData.imgsToRemove.length > 0) {
      console.log(`Removing ${updateData.imgsToRemove.length} images...`);
      await deleteImagesFromCloudinary(updateData.imgsToRemove);
      roh.imgs = roh.imgs.filter(img => !updateData.imgsToRemove.includes(img));
      console.log("Images removed from record.");
    }
    if (updateData.imgsToAdd && updateData.imgsToAdd.length > 0) {
      console.log(`Adding ${updateData.imgsToAdd.length} new images...`);
      const newUrls = await uploadImagesToCloudinary(updateData.imgsToAdd); // Catch errors below
      roh.imgs.push(...newUrls);
       console.log("New images added to record.");
    }

    // Apply other updates
    console.log("Applying field updates...");
    Object.entries(updateData).forEach(([key, val]) => {
      if (!["user", "_id", "reviews", "averageRating", "reviewCount", "imgs", "imgsToAdd", "imgsToRemove"].includes(key)) {
        // Handle conditional rentPrice logic
        if (key === "isForHelp") {
          roh.isForHelp = val;
          if (val) {
             console.log("Setting isForHelp=true, clearing rentPrice.");
             roh.rentPrice = undefined;
          }
        } else if (key === "rentPrice") {
            if (!roh.isForHelp) {
                console.log(`Updating rentPrice to ${val}`);
                roh.rentPrice = val;
            } else {
                console.log("Ignoring rentPrice update because isForHelp=true.");
            }
        } else {
          roh[key] = val; // Update other fields
        }
      }
    });

    console.log("Saving updated RoH item...");
    const updated = await roh.save(); // Mongoose validation runs here
    console.log(`RoH item ${id} updated successfully.`);
    res.status(200).json({ success: true, data: updated });

  } catch (err) {
    if (err.name === 'ValidationError') {
        console.error(`Mongoose Validation Error during update for ID ${id}:`, err.message);
        return sendError(res, 400, "Validation failed", err.errors);
    }
     // Check if it's a Cloudinary upload error potentially wrapped
    if (err.message && err.message.includes("Cloudinary")) {
        return sendError(res, 500, "Image upload failed during update", err);
    }
     if (err.kind === 'ObjectId') {
        console.log(`Invalid ID format received for update: ${id}`);
        return sendError(res, 400, "Invalid ID format");
    }
    return sendError(res, 500, `Failed to update RoH item ${id}`, err);
  }
};

// Delete
const deleteRoh = async (req, res) => {
  const { id } = req.params;
  console.log(`--- deleteRoh Request Received for ID: ${id} ---`);
  try {
    const userId = req.user._id;

    const roh = await Roh.findById(id);
    if (!roh) {
        console.log(`RoH item not found for deletion, ID: ${id}`);
        return sendError(res, 404, "RoH item not found");
    }
    if (roh.user.toString() !== userId.toString()) {
        console.warn(`Unauthorized delete attempt by User ${userId} on RoH item ${id} owned by ${roh.user}`);
        return sendError(res, 403, "Unauthorized to delete this item");
    }

    console.log(`Deleting images for RoH item ${id}...`);
    await deleteImagesFromCloudinary(roh.imgs); // Logs errors internally but continues

    console.log(`Deleting RoH item ${id} from database...`);
    await roh.deleteOne(); // Correct method for deleting fetched instance
    console.log(`RoH item ${id} deleted successfully.`);

    res.status(200).json({ success: true, message: "RoH item deleted successfully" });
  } catch (err) {
     if (err.kind === 'ObjectId') {
        console.log(`Invalid ID format received for delete: ${id}`);
        return sendError(res, 400, "Invalid ID format");
    }
    return sendError(res, 500, `Failed to delete RoH item ${id}`, err);
  }
};

// Add review
const addRohReview = async (req, res) => {
  const { id } = req.params; // RoH item ID
  console.log(`--- addRohReview Request Received for RoH ID: ${id} ---`);
  console.log("Request Body:", req.body);

  try {
    const { text, rating } = req.body;
    const userId = req.user._id;

    if (!text || rating === undefined) {
      return sendError(res, 400, "Review text and rating are required");
    }
     if (typeof rating !== 'number' || rating < 0 || rating > 5) {
       return sendError(res, 400, "Rating must be a number between 0 and 5");
    }

    const roh = await Roh.findById(id);
    if (!roh) {
        console.log(`RoH item not found for adding review, ID: ${id}`);
        return sendError(res, 404, "RoH item not found");
    }
    if (roh.user.toString() === userId.toString()) {
        console.warn(`User ${userId} attempted to review own item ${id}`);
        return sendError(res, 403, "You cannot review your own item");
    }

    const alreadyReviewed = roh.reviews.some(r => r.user.toString() === userId.toString());
    if (alreadyReviewed) {
        console.warn(`User ${userId} already reviewed item ${id}`);
        return sendError(res, 409, "You have already reviewed this item");
    }

    console.log(`Adding review by User ${userId} to RoH item ${id}...`);
    roh.reviews.push({ user: userId, text, rating });

    console.log("Recalculating ratings and saving...");
    const updated = await roh.calculateRatings(); // Assumes this method also saves

    // Optional: Notify owner
    if (roh.user.toString() !== userId.toString()) {
      console.log(`Sending review notification to owner ${roh.user}`);
      try {
           await Notification.create({
                type: "review",
                recipient: roh.user,
                sender: userId,
                targetId: roh._id, // Link notification to the RoH item
                targetModel: 'Roh',
                message: `${req.user.username || 'Someone'} reviewed your item: ${roh.productName}`,
           });
           console.log("Notification created successfully.");
      } catch (notificationError) {
          console.error("Failed to create review notification:", notificationError);
          // Don't block the response for notification failure
      }
    }

    console.log("Populating review user details before sending response...");
    const populated = await Roh.findById(updated._id)
      .populate("user", "username profileImg")
      .populate("reviews.user", "username profileImg");

    console.log(`Review added successfully to RoH item ${id}.`);
    res.status(201).json({ success: true, data: populated });

  } catch (err) {
     if (err.name === 'ValidationError') {
        console.error(`Mongoose Validation Error adding review for ID ${id}:`, err.message);
        return sendError(res, 400, "Validation failed", err.errors);
    }
     if (err.kind === 'ObjectId') {
        console.log(`Invalid RoH ID format received for review: ${id}`);
        return sendError(res, 400, "Invalid RoH item ID format");
    }
    return sendError(res, 500, `Failed to add review to RoH item ${id}`, err);
  }
};

// Optional: update review
const updateReview = async (req, res) => {
  const { rohId, reviewId } = req.params;
  console.log(`--- updateReview Request Received for RoH ID: ${rohId}, Review ID: ${reviewId} ---`);
  console.log("Request Body:", req.body);

  try {
    const { text, rating } = req.body;
    const userId = req.user._id;

    if (text === undefined && rating === undefined) {
       return sendError(res, 400, "Provide text or rating to update.");
    }
     if (rating !== undefined && (typeof rating !== 'number' || rating < 0 || rating > 5)) {
       return sendError(res, 400, "Rating must be a number between 0 and 5");
    }

    const roh = await Roh.findById(rohId);
    if (!roh) {
        console.log(`RoH item not found for updating review, ID: ${rohId}`);
        return sendError(res, 404, "RoH item not found");
    }

    const review = roh.reviews.id(reviewId); // Efficient way to find subdocument by ID
    if (!review) {
        console.log(`Review not found for update, ID: ${reviewId} on RoH ${rohId}`);
        return sendError(res, 404, "Review not found");
    }
    if (review.user.toString() !== userId.toString()) {
        console.warn(`Unauthorized review update attempt by User ${userId} on Review ${reviewId} (owned by ${review.user})`);
        return sendError(res, 403, "Cannot update another user's review");
    }

    console.log(`Updating Review ${reviewId} on RoH ${rohId}...`);
    review.text = text !== undefined ? text : review.text; // Update if provided
    review.rating = rating !== undefined ? rating : review.rating; // Update if provided

    console.log("Recalculating ratings and saving...");
    const updated = await roh.calculateRatings(); // Assumes this method also saves

    console.log(`Review ${reviewId} updated successfully.`);
    res.status(200).json({ success: true, data: updated });

  } catch (err) {
     if (err.name === 'ValidationError') { // Should not happen if model is correct, but good practice
        console.error(`Mongoose Validation Error updating review ${reviewId}:`, err.message);
        return sendError(res, 400, "Validation failed", err.errors);
    }
    if (err.kind === 'ObjectId') {
        console.log(`Invalid ID format for updateReview: RoH=${rohId}, Review=${reviewId}`);
        return sendError(res, 400, "Invalid ID format");
    }
    return sendError(res, 500, `Failed to update review ${reviewId}`, err);
  }
};

// Optional: delete review
const deleteReview = async (req, res) => {
  const { rohId, reviewId } = req.params;
  console.log(`--- deleteReview Request Received for RoH ID: ${rohId}, Review ID: ${reviewId} ---`);

  try {
      const userId = req.user._id;

      const roh = await Roh.findById(rohId);
      if (!roh) {
          console.log(`RoH item not found for deleting review, ID: ${rohId}`);
          return sendError(res, 404, "RoH item not found");
      }

      const review = roh.reviews.id(reviewId); // Find subdocument by ID
      if (!review) {
           console.log(`Review not found for deletion, ID: ${reviewId} on RoH ${rohId}`);
           return sendError(res, 404, "Review not found");
      }

      // Authorization Check: Allow owner of the item OR owner of the review to delete
      if (review.user.toString() !== userId.toString() && roh.user.toString() !== userId.toString()) {
           console.warn(`Unauthorized review delete attempt by User ${userId} on Review ${reviewId}`);
           return sendError(res, 403, "Unauthorized to delete this review");
      }

      console.log(`Deleting Review ${reviewId} by User ${review.user} from RoH ${rohId}...`);
      review.deleteOne(); // Mongoose <v8 way to remove subdocument instance
      // For Mongoose v8+: roh.reviews.pull({ _id: reviewId }); or review.remove();

      console.log("Recalculating ratings and saving...");
      const updated = await roh.calculateRatings(); // Assumes this method also saves

      console.log(`Review ${reviewId} deleted successfully.`);
      res.status(200).json({ success: true, data: updated });
  } catch (err) {
     if (err.kind === 'ObjectId') {
        console.log(`Invalid ID format for deleteReview: RoH=${rohId}, Review=${reviewId}`);
        return sendError(res, 400, "Invalid ID format");
    }
    return sendError(res, 500, `Failed to delete review ${reviewId}`, err);
  }
};

module.exports = {
  createRoh,
  getAllRohs,
  getUserRohs,
  getRohById,
  updateRoh,
  deleteRoh,
  addRohReview,
  updateReview,
  deleteReview,
};
