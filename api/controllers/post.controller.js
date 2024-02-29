import Post from "../models/post.model.js";
import { errorHandler } from "../utils/error.js";
import User from "../models/user.model.js";

export const createpost = async (req, res, next) => {
  if (!req.body.caption) {
    return next(errorHandler(400, "Please provide Caption"));
  }

  try {
    const newPost = new Post({
      ...req.body,
      userId: req.user.id,
      author: req.user.id, // Set the author data here
    });

    // Save the new post
    const savedPost = await newPost.save();

    // Add the newly created post to the user's posts array
    await User.findByIdAndUpdate(
      req.user.id,
      { $push: { posts: savedPost._id } },
      { new: true }
    );

    res.status(201).json(savedPost);
  } catch (error) {
    next(error);
  }
};

export const getposts = async (req, res, next) => {
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 5; // Adjust the limit as needed
    const sortDirection = req.query.order === "asc" ? 1 : -1;

    // Fetch posts from the database based on various query parameters
    const postsQuery = Post.find({
      ...(req.query.userId && { userId: req.query.userId }),
      ...(req.query.postId && { _id: req.query.postId }),
      ...(req.query.searchTerm && {
        $or: [
          { caption: { $regex: req.query.searchTerm, $options: "i" } },
          { tags: { $regex: req.query.searchTerm, $options: "i" } },
        ],
      }),
    })
      .populate("author")
      .sort({ createdAt: sortDirection }) // Sorting by createdAt field
      .skip(startIndex) // Pagination: Skip the specified number of documents
      .limit(limit); // Pagination: Limit the number of documents returned

    // Execute the query to get posts
    const posts = await postsQuery.exec();

    // Send the response with modified data
    res.status(200).json({
      posts,
      hasMore: posts.length === limit, // Check if there are more posts to fetch
    });
  } catch (error) {
    next(error); // Forward the error to the error handling middleware
  }
};

export const getPostById = async (req, res, next) => {
  try {
    // Extract the post ID from the request parameters
    const postId = req.params.id;

    // Fetch the post from the database by its ID
    const post = await Post.findById(postId).populate("author");

    // Check if the post with the given ID exists
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Send the response with the retrieved post data
    res.status(200).json({ post });
  } catch (error) {
    // Handle errors
    next(error); // Forward the error to the error handling middleware
  }
};

export const likePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);
    const user = await User.findById(req.user.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Initialize the likes array if it's undefined
    if (!post.likes) {
      post.likes = [];
    }

    // Check if the user has already liked the post
    const userLikedIndex = post.likes.findIndex(
      (like) => like.userId === req.user.id
    );

    if (userLikedIndex === -1) {
      // Add the like interaction to the post
      const newLike = {
        userId: req.user.id,
        name: req.body.name,
        pic: req.body.pic,
      };

      post.likes.push(newLike);

      // Increment the number of likes
      post.numberOfLikes += 1;

      // Add the post to the user's likedPosts
      user.likedPosts.push(post._id);

      await post.save(); // Save the post after updating
      await user.save(); // Save the user after updating

      // Send success message
      return res.status(200).json({ message: "Post liked successfully", post });
    } else {
      // If the user has already liked the post, remove the like interaction
      post.likes.splice(userLikedIndex, 1);

      // Decrement the number of likes
      post.numberOfLikes -= 1;

      // Remove the post from the user's likedPosts
      const postIndex = user.likedPosts.indexOf(post._id);
      if (postIndex > -1) {
        user.likedPosts.splice(postIndex, 1);
      }

      await post.save(); // Save the post after updating
      await user.save(); // Save the user after updating

      // Send success message
      return res
        .status(200)
        .json({ message: "Post unliked successfully", post });
    }
  } catch (error) {
    // Handle errors
    next(error);
  }
};

export const deletePost = async (req, res, next) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      return next(errorHandler(404, "Post not found"));
    }

    if (post.userId !== req.user.id) {
      return next(
        errorHandler(403, "You are not authorized to delete this post")
      );
    }

    await User.updateMany(
      {},
      { $pull: { savedPosts: postId, likedPosts: postId } }
    );

    await Post.findByIdAndDelete(postId); // Use findByIdAndDelete instead of findByIdAndRemove

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error:", error);
    next(error);
  }
};

export const updatePost = async (req, res, next) => {};

/**
 * Fetches saved posts from the database based on various query parameters.
 * @param {Object} req - The request object containing all the information about the request sent by the client.
 * @param {Object} res - The response object used to send back the desired HTTP response.
 * @returns {Promise<JSON>} A promise that resolves to a JSON object containing the fetched posts. If there is an error, it sends a server error response.
 */
export const getSavedPosts = async (req, res) => {
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 5; // Adjust the limit as needed

    // Get the user ID from the authenticated user
    const userId = req.params.id;

    // Find the user's saved posts in the database
    const savedPostsQuery = Post.find({ savedBy: userId })
      .populate("author") // Populate the author data here
      .skip(startIndex) // Pagination: Skip the specified number of documents
      .limit(limit); // Pagination: Limit the number of documents returned

    // Execute the query to get saved posts
    const savedPosts = await savedPostsQuery.exec();

    // Send the response with modified data
    res.status(200).json({
      savedPosts,
      hasMore: savedPosts.length === limit, // Check if there are more posts to fetch
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getSearchResults = async (req, res, next) => {
  try {
    const searchTerm = req.query.searchTerm;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    const users = await User.find({
      $or: [
        { username: { $regex: searchTerm, $options: "i" } },
        { fullName: { $regex: searchTerm, $options: "i" } },
      ],
    })
      .skip((page - 1) * limit)
      .limit(limit);


      if(!users) {
        return next(errorHandler(404, "User not found"));
      }

    res.status(200).json({ users,  hasMore: users.length === limit, });
  } catch (error) {
    next(error.message);
  }
};
