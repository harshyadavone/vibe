import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import mongoose from "mongoose";
import { errorHandler } from "../utils/error.js";

export const signout = (req, res, next) => {
  try {
    res
      .clearCookie("access_token")
      .status(200)
      .json("User has been signed out");
  } catch (error) {
    next(error);
  }
};

async function savePost(req, res) {
  try {
    const userId = req.body.userId;
    const postId = req.body.postId;

    // Update the User model
    const user = await User.findById(userId);
    if (!user.savedPosts.includes(postId)) {
      user.savedPosts.push(postId);
      await user.save();
    }

    // Update the Post model
    const post = await Post.findById(postId);
    if (!post.savedBy.includes(userId)) {
      post.savedBy.push(userId);
      await post.save();
    }

    // Fetch the updated post data
    const updatedPost = await Post.findById(postId).populate("savedBy");

    res
      .status(200)
      .json({ message: "Post saved successfully.", post: updatedPost });
  } catch (error) {
    res.status(500).json({ error: "An error occurred while saving the post." });
  }
}

async function unsavePost(req, res) {
  try {
    const userId = req.body.userId;
    const postId = req.body.postId;

    // Update the User model
    const user = await User.findById(userId);
    const userIndex = user.savedPosts.indexOf(postId);
    if (userIndex > -1) {
      user.savedPosts.splice(userIndex, 1);
      await user.save();
    }

    // Update the Post model
    const post = await Post.findById(postId);
    const postIndex = post.savedBy.indexOf(userId);
    if (postIndex > -1) {
      post.savedBy.splice(postIndex, 1);
      await post.save();
    }

    // Fetch the updated post data
    const updatedPost = await Post.findById(postId).populate("savedBy");

    res
      .status(200)
      .json({ message: "Post unsaved successfully.", post: updatedPost });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while unsaving the post." });
  }
}

export const getSaved = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Find the user by userId and populate the savedPosts field,
    // and then populate the author field for each saved post
    const user = await User.findById(userId).populate({
      path: "savedPosts",
      options: {
        skip: (page - 1) * limit,
        limit: limit,
      },
      populate: {
        path: "author",
        select: "username fullName avatar _id ", // Select the fields you want to populate for the author
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Extract saved posts from the user document
    const savedPosts = user.savedPosts;

    // Check if there are more pages
    const nextPage = savedPosts.length === limit ? page + 1 : null;

    return res.status(200).json({ savedPosts, nextPage });
  } catch (error) {
    // Handle errors
    next(error);
  }
};


export const getProfile = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid User ID" });
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update Profile
export const updateProfile = async (req, res, next) => {
  // Check if the authenticated user is updating their own profile
  if (req.user.id !== req.params.userId) {
    return next(errorHandler(403, "You can only update your own profile"));
  }

  // // Check if the new password is provided and meets the criteria
  // if (req.body.password) {
  //   if (req.body.password.length < 6) {
  //     return next(
  //       errorHandler(400, "Password must be at least 6 characters long")
  //     );
  //   }
  //   // Hash the new password
  //   req.body.password = await bcryptjs.hash(req.body.password, 10);
  // }

  // Check if the username is provided and meets the criteria
  if (req.body.username) {
    if (req.body.username.length < 3 || req.body.username.length > 20) {
      return next(
        errorHandler(400, "Username must be between 3 and 20 characters")
      );
    }
    if (req.body.username.includes(" ")) {
      return next(errorHandler(400, "Username cannot contain spaces"));
    }
    if (req.body.username !== req.body.username.toLowerCase()) {
      return next(errorHandler(400, "Username must be lower case"));
    }
    if (!req.body.username.match(/^[a-zA-Z0-9]+$/)) {
      return next(
        errorHandler(400, "Username can only contain letters and numbers")
      );
    }
  }

  // Check if the email is provided and is a valid email address
  // if (req.body.email) {
  //   if (!validator.isEmail(req.body.email)) {
  //     return next(errorHandler(400, "Invalid email address"));
  //   }
  // }

  // Check if fullName is provided and meets validation criteria
  if (req.body.fullName) {
    if (req.body.fullName.length > 100) {
      return next(errorHandler(400, "Full name cannot exceed 100 characters"));
    }
  }

  // Check if bio is provided and meets validation criteria
  if (req.body.bio) {
    if (req.body.bio.length > 250) {
      return next(errorHandler(400, "Bio cannot exceed 250 characters"));
    }
  }


  try {
    // Update the user profile fields
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          avatar: req.body.avatar,
          fullName: req.body.fullName,
          bio: req.body.bio,
        },
      },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
};

export const deleteProfile = async (req, res, next) => {
  try {
    const userId = req.params.userId;

    // Check if userId is provided
    if (!userId) {
      return next(errorHandler(400, "User ID is required"));
    }

    // Check if userId is valid
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return next(errorHandler(400, "Invalid User ID"));
    }

    if (req.user.id !== userId) {
      return next(
        errorHandler(403, "You are not authorize to delete this account")
      );
    }
    // Check if user exists before deleting
    const user = await User.findById(userId);
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    // Delete the user
    const deletedUser = await User.findByIdAndDelete(userId);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    next(err);
  }
};

export const followUser = async (req, res, next) => {
  try {
    const userId = req.params.userId;

    // Check if userId is provided
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Check if userId is valid
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid User ID" });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the authenticated user is trying to follow themselves
    if (req.user.id === String(user._id)) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    // Check if the authenticated user is already following the target user
    if (user.followers.includes(req.user._id)) {
      return res
        .status(400)
        .json({ message: "You are already following this user" });
    }

    // Add the authenticated user to the followers list of the target user
    user.followers.push(req.user.id);
    await user.save();

    // Get the authenticated user
    const authUser = await User.findById(req.user.id);

    // Add the target user to the following list of the authenticated user
    authUser.following.push(userId);
    await authUser.save();

    res.json(user);
  } catch (err) {
    next(err);
  }
};

export const unfollowUser = async (req, res, next) => {
  try {
    const userId = req.params.userId;

    // Check if userId is valid
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return next(errorHandler(400, "Invalid User ID"));
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    // Check if the authenticated user is already following the user
    const isFollowing = user.followers.includes(req.user.id);
    if (!isFollowing) {
      return next(errorHandler(400, "You are not following this user"));
    }

    // Remove the authenticated user from the followers array
    user.followers.pull(req.user.id);
    await user.save();

    // Get the authenticated user
    const authUser = await User.findById(req.user.id);

    // Remove the target user from the following list of the authenticated user
    authUser.following.pull(userId);
    await authUser.save();

    res.json({ success: true, message: "Successfully unfollowed user", user });
  } catch (err) {
    next(err);
  }
};

// Get User Posts
export const getUserPosts = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default to 10 posts per page

    // Check if userId is provided
    if (!userId) {
      return next(errorHandler(400, "User ID is required"));
    }

    // Check if userId is valid
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return next(errorHandler(400, "Invalid User ID"));
    }

    // Find the user by userId and populate the posts field with pagination
    const user = await User.findById(userId).populate({
      path: "posts",
      options: {
        skip: (page - 1) * limit,
        limit: limit,
        sort: { createdAt: -1 },
      },
    });

    // Check if user exists
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Extract posts from the user document
    const posts = user.posts;

    // Check if there are more pages
    const nextPage = posts.length === limit ? page + 1 : null;

    return res.status(200).json({ posts, nextPage });
  } catch (error) {
    // Handle errors
    next(error);
  }
};

// Get User Comments
export const getUserComments = async (req, res) => {
  try {
    const comments = await Comment.find({ author: req.params.userId }); // assuming you have a Comment model
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getLikedPosts = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Calculate the starting index
    const startIndex = (page - 1) * limit;

    // Find the user by userId and populate the likedPosts field
    const user = await User.findById(userId).populate({
      path: "likedPosts",
      options: {
        skip: startIndex,
        limit: limit,
        sort: { created: -1 },
      },
      populate: {
        path: "author",
        select: "username fullName avatar _id ", // Select the fields you want to populate for the author
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Extract liked posts from the user document
    const likedPosts = user.likedPosts;

    // Check if there are more pages
    const nextPage = likedPosts.length === limit ? page + 1 : null;

    return res.status(200).json({ likedPosts, nextPage });
  } catch (error) {
    // Handle errors
    next(error);
  }
};

export const addSocialLink = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Add the new link
    user.socialLinks[req.body.platform] = req.body.link;
    await user.save();

    res.json(user.socialLinks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSocialLink = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the link
    user.socialLinks[req.params.platform] = req.body.link;
    await user.save();

    res.json(user.socialLinks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeSocialLink = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove the link
    delete user.socialLinks[req.params.platform];
    await user.save();

    res.json(user.socialLinks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFollowers = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Find the user by userId and populate the followers field
    const user = await User.findById(userId).populate({
      path: "followers",
      options: {
        skip: (page - 1) * limit,
        limit: limit,
      },
    });

    // Check if user exists
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Extract followers from the user document
    const followers = user.followers;

    // Check if there are more pages
    const nextPage = followers.length === limit ? page + 1 : null;

    return res.status(200).json({ followers, nextPage });
  } catch (error) {
    // Handle errors
    next(error);
  }
};

export const getFollowing = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Find the user by userId and populate the following field
    const user = await User.findById(userId).populate({
      path: "following",
      options: {
        skip: (page - 1) * limit,
        limit: limit,
      },
    });

    // Check if user exists
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Extract following from the user document
    const following = user.following;

    // Check if there are more pages
    const nextPage = following.length === limit ? page + 1 : null;

    return res.status(200).json({ following, nextPage });
  } catch (error) {
    // Handle errors
    next(error);
  }
};

export { savePost, unsavePost };
