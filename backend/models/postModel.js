const mongoose = require('mongoose');

// Define a separate schema for comments to properly include timestamps
const commentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true } // This will add createdAt and updatedAt to each comment
);

const postSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		text: {
			type: String,
		},
		imgs: [
			{
				type: String,
			}
		],
		likes: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			},
		],
		comments: [commentSchema],
	},
	{ timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

module.exports = Post;