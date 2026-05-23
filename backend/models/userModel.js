const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
    },
    fullName: {
      type: String,
    },
    password: {
      type: String,
      required: true,
      minLength: 6,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    profileImg: {
      type: String,
      default: "",
    },
    coverImg: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    link: {
      type: String,
      default: "",
    },
    likedPosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        default: [],
      },
    ],
    savedPosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        default: [],
      },
    ],
    interestedAds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ad",
        default: [],
      },
    ],

    profession: { type: String, default: "" }, // Director, Editor, etc.
    skills: [{ type: String, default: [] }], // Array of skills (e.g., Cinematography, VFX)
    experienceLevel: { 
      type: String, 
      enum: ["Beginner", "Intermediate", "Professional"], 
      default: "Beginner" 
    },
    genres: [{ type: String, default: [] }], // Preferred genres (e.g., Action, Drama)
    location: { type: String, default: "" }, // City, Country

    onboardingCompleted: { type: Boolean, default: false }, // Track if onboarding is completed
    interests: [{ type: String, default: [] }], // Categories of interest (e.g., Filmmaking, Screenwriting)
    preferredCollabTypes: [{ type: String, default: [] }], // Short Films, Documentaries, Music Videos, etc.

    pastProjects: [{ type: String, default: [] }], // Links to past work (portfolio, YouTube, IMDb, etc.)
    availableForCollaboration: { type: Boolean, default: true }, // Open for projects
    equipmentOwned: [{ type: String, default: [] }], // List equipment they own
    rentalListings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Ad", default: [] }], // Track user's rental ads

    totalPosts: { type: Number, default: 0 }, // Track number of posts created
    totalCollabs: { type: Number, default: 0 }, // Number of collab requests created
    totalConnections: { type: Number, default: 0 }, // Followers + following count
    lastActive: { type: Date, default: Date.now }, // Track last activity
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
