import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      default: function () {
        return this.username; // Set username as the default value for fullName
      },
      trim: true,
      maxlength: 100,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 250,
    },
    avatar: {
      type: String,
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    likedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    socialLinks: {
      instagram: { type: String, trim: true },
      github: { type: String, trim: true },
      // Add more social media platforms as needed
    },    
    createdAt: {
      type: Date,
      default: Date.now,
    },

  },
  { timestamps: true, toJSON: { virtuals: true } }
);

const User = mongoose.model("User", userSchema);

export default User;
