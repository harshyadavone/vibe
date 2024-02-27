import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    ownerId: {
      type: String,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    userId: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
      required: true,
    },
    location: {
      type: String,
    },
    image: {
      type: String,
    },
    likes: [
      {
        userId: {
          type: String,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        pic: {
          type: String,
        },
      },
    ],
    numberOfLikes: {
      type: Number,
      default: 0,
    },
    tags: [
      {
        type: String,
      },
    ],
    savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    numberOfComments: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

export default Post;
