const mongoose = require("mongoose");

const rohSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    productName: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
      minlength: [10, 'Description must be at least 10 characters long.'],
      maxlength: 2000,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "Cameras and Accessories",
        "Lighting Equipment",
        "Audio Gear",
        "Storage and Memory",
        "Studio Setup",
        "Drones and Aerial Equipment",
        "Mobile Filmmaking",
      ],
    },

    department: {
      type: String,
      required: true,
      enum: ["Filmmaking", "Photography", "Audio Production", "Post-Production", "Other"],
    },

    isForHelp: {
      type: Boolean,
      default: false,
      required: true,
    },

    rentPrice: {
      type: Number,
      required: function () {
        return !this.isForHelp;
      },
      validate: {
        validator: function (value) {
          return this.isForHelp ? value == null : value != null;
        },
        message: function () {
          return this.isForHelp
            ? "Rent price should not be set when the item is for help."
            : "Rent price is required when the item is not for help.";
        },
      },
    },

    isNegotiable: {
      type: Boolean,
      default: false,
      required: true,
    },

    imgs: [
      {
        type: String,
      },
    ],

    location: {
      type: String,
      required: true,
    },

    availability: {
      from: {
        type: Date,
      },
      to: {
        type: Date,
      },
    },

    status: {
      type: String,
      enum: ["available", "unavailable", "lent", "reserved"],
      default: "available",
    },

    visibility: {
      type: String,
      enum: ["public", "private", "followers"],
      default: "public",
    },

    postExpiresAt: {
      type: Date,
    },

    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    reviewCount: {
      type: Number,
      default: 0,
    },

    reviews: [
      {
        text: {
          type: String,
          required: true,
        },
        rating: {
          type: Number,
          min: 0,
          max: 5,
          required: true,
        },
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Optional: Middleware to recalculate avg rating + count on review change
rohSchema.methods.calculateRatings = function () {
  if (this.reviews.length === 0) {
    this.averageRating = 0;
    this.reviewCount = 0;
  } else {
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    this.averageRating = sum / this.reviews.length;
    this.reviewCount = this.reviews.length;
  }
  return this.save();
};

// Optionally trigger this logic on review updates via middleware if needed

const Roh = mongoose.model("Roh", rohSchema);

module.exports = Roh;
