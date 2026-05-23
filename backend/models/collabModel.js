const mongoose = require("mongoose");

const joinRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  requestDate: {
    type: Date,
    default: Date.now,
    required: true,
  },
  note: {
    type: String,
    required: true,
  },
  interestedRole: [
    {
      type: String,
      enum: ["Video Editor", "Audio Mixer", "Cinematographer", "Scriptwriter", "Voice Artist", "Actor", "Director", "Producer", "Other"],
    },
  ],
  experienceLink: {
    type: String,
    required: true,
  },
});

const collabSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    projectType: {
      type: String,
      required: true,
      enum: ["Short Film", "Feature Film", "Documentary", "Music Video", "Commercial", "Youtube Video", "Reels or Shorts", "Other"],
    },
    genres: [
      {
        type: String,
        enum: ["Action", "Comedy", "Drama", "Horror", "Sci-Fi", "Romance", "Documentary", "Other"],
      },
    ],
    description: {
      type: String,
      required: true,
    },
    isPaid: {
      type: Boolean,
      default: false,
      required: true,
    },
    pay: {
      type: Number,
      required: function () {
        return this.isPaid;
      },
    },
    timePeriod: {
      type: String,
      enum: ["Less than a week", "Less than a month", "Less than 3 months", "More than 3 months"],
    },
    location: {
      type: String, 
      required: true,
    },
    requiredCraftsmen: [
      {
        type: String,
        enum: ["Video Editor", "Audio Mixer", "Cinematographer", "Scriptwriter", "Voice Artist", "Actor", "Director", "Producer", "Other"],
      },
    ], 
    imgs: [
      {
        type: String,
      },
    ],
    joinRequests: [joinRequestSchema], // Storing all join requests with details
    acceptedParticipants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ], // Storing accepted participants
    rejectedParticipants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ], // Storing rejected participants for frontend feedback
    deadline: {
      type: Date,
      required: true, // Deadline to apply
    },
    referenceLinks: [
      {
        type: String,
      },
    ], // Links provided by the creator
  },
  { timestamps: true }
);

const Collab = mongoose.model("Collab", collabSchema);

module.exports = Collab;
