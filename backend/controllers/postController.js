const Notification = require("../models/notificationModel");
const Post = require("../models/postModel");
const User = require("../models/userModel");
var cloudinary = require("cloudinary").v2;

const createPost = async (req, res) => {
  try {
    const { text, imgs } = req.body;
    const userId = req.user._id.toString();

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!text && (!imgs || imgs.length === 0)) {
      return res.status(400).json({ error: "Post must have text or images" });
    }

    let imgUrls = [];
    if (imgs && imgs.length > 0) {
      for (const img of imgs) {
        const uploadedResponse = await cloudinary.uploader.upload(img, {
          folder: "posts",
          transformation: [
              { width: 500, crop: "scale" },
              { quality: 'auto:best' },
              { fetch_format: "auto" }
          ]
      });
        imgUrls.push(uploadedResponse.secure_url);
      }
    }

    const newPost = new Post({
      user: userId,
      text,
      imgs: imgUrls,
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.error("Error in createPost controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ error: "You are not authorized to delete this post" });
    }

    if (post.imgs && post.imgs.length > 0) {
      for (const img of post.imgs) {
        const imgId = img.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(imgId);
      }
    }

    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.log("Error in deletePost controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const commentOnPost = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;

    if (!text) {
      return res.status(400).json({ error: "Text field is required" });
    }
    
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Create the comment with text and user
    const comment = { user: userId, text };
    
    // Push the comment to the post's comments array
    post.comments.push(comment);
    await post.save();

    const commentNotification = new Notification({
      type: "comment",
      from: userId,
      to: post.user,
    });
    await commentNotification.save();

    // Find the newly created comment to return with populated user data
    const updatedPost = await Post.findById(postId)
      .populate({
        path: 'comments.user',
        select: '_id username fullName profileImg'
      });
    
    // Get the newly added comment (the last one)
    const newComment = updatedPost.comments[updatedPost.comments.length - 1];

    // Return just the new comment with all necessary data
    res.status(200).json(newComment);
  } catch (error) {
    console.log("Error in commentOnPost controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const likeUnlikePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id: postId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const userLikedPost = post.likes.includes(userId);

		if (userLikedPost) {
			// Unlike post
			await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
			await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });

			const updatedLikes = post.likes.filter((id) => id.toString() !== userId.toString());
			res.status(200).json(updatedLikes);
		} else {
			// Like post
			post.likes.push(userId);
			await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
			await post.save();

			const notification = new Notification({
				from: userId,
				to: post.user,
				type: "like",
			});
			await notification.save();

			const updatedLikes = post.likes;
			res.status(200).json(updatedLikes);
		} 
  } catch (error) {
    console.log("Error in likeUnlikePost controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    const totalPosts = await Post.countDocuments();
    const hasMore = skip + posts.length < totalPosts;

    res.status(200).json({
      posts,
      hasMore,
      nextPage: hasMore ? page + 1 : null
    });
  } catch (error) {
    console.log("Error in getAllPosts controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getLikedPosts = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    res.status(200).json(likedPosts);
  } catch (error) {
    console.log("Error in getLikedPosts controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getFollowingPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const following = user.following || [];

    // If user isn't following anyone, return empty array
    if (following.length === 0) {
      return res.status(200).json([]);
    }

    const feedPosts = await Post.find({ user: { $in: following } })
      .sort({ createdAt: -1 })
      .populate({ 
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    // If no posts found, return empty array
    if (!feedPosts) {
      return res.status(200).json([]);
    }

    res.status(200).json(feedPosts);
  } catch (error) {
    console.error("Error in getFollowingPosts controller: ", error);
    res.status(500).json({ error: "Failed to fetch following posts" });
  }
};

const getUserPosts = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: "User not found" });

    const posts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    res.status(200).json(posts);
  } catch (error) {
    console.log("Error in getUserPosts controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createPost,
  deletePost,
  commentOnPost,
  likeUnlikePost,
  getAllPosts,
  getLikedPosts,
  getFollowingPosts,
  getUserPosts,
};
