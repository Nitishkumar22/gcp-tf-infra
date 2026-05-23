const mongoose = require("mongoose");

const adSchema = new mongoose.Schema(
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
    category: {
      type: String,
      required: true,
      enum: ['Camera', 'Lens', 'Audio', 'Lighting', 'Accessories', 'Other']
    },
    subcategory: {
      type: [String],
      validate: {
        validator: function(v) {
          return v.length > 0;
        },
        message: 'At least one subcategory is required'
      }
    },
    description: {
      type: String,
      required: true,
    },
    bought_on: {
      type: Date,
      default: Date.now,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isFinite,
        message: '{VALUE} is not a valid price'
      }
    },
    currency: {
      type: String,
      enum: ['USD', 'EUR', 'INR'],
      default: 'USD',
      required: true
    },
    isNegotiable: {
      type: Boolean,
      default: false,
      required: true,
    },
    isSold: {
      type: Boolean,
      default: false,
    },
    location: {
      type: String,
      required: true,
    },
    tags: [
      {
        type: String,
      },
    ],
    warranty: {
      hasWarranty: {
        type: Boolean,
        default: false
      },
      expiryDate: {
        type: Date
      },
      details: {
        type: String
      }
    },
    imgs: [{
      url: {
        type: String,
        // required: true
      },
      isPrimary: {
        type: Boolean,
        // default: false
      }
    }],
    interests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    condition: {
      type: String,
      required: true,
      enum: ['New', 'Like New', 'Good', 'Fair', 'Poor'],
      default: 'Good'
    },
    contactPreferences: {
      email: {
        type: Boolean,
        default: true
      },
      phone: {
        type: Boolean,
        default: true
      },
      chat: {
        type: Boolean,
        default: true
      }
    },
    status: {
      type: String,
      enum: ['available', 'pending', 'sold', 'reserved', 'expired'],
      default: 'available',
      required: true
    },
    views: {
      type: Number,
      default: 0
    },
    shipping: {
      available: {
        type: Boolean,
        default: false
      },
      cost: {
        type: Number,
        min: 0
      },
      methods: [{
        type: String,
        enum: ['Local Pickup', 'Domestic Shipping', 'International']
      }]
    },
    brand: {
      type: String
    },
    model: {
      type: String
    },
  },
  { timestamps: true }
);

// Ensure at least one image is present
// adSchema.pre("validate", function (next) {
//   if (!this.imgs || this.imgs.length === 0) {
//     return next(new Error("At least one image is required"));
//   }
//   next();
// });
const Ad = mongoose.model("Ad", adSchema);

module.exports = Ad;
