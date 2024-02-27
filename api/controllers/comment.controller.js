import Comment from "../models/comment.model.js";
import Post from "../models/post.model.js";
import { errorHandler } from "../utils/error.js";

export const createComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    const { postId } = req.params;
    const author = req.user.id;

    if (!author) {
      return next(errorHandler(404, "Author is required"));
    }
    if (!postId) {
      return next(errorHandler(404, "Post ID is required"));
    }
    if (!content) {
      return next(errorHandler(404, "Content is required"));
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const comment = await Comment.create({
      content,
      author,
      post: postId,
    });

    post.numberOfComments += 1;
    await post.save();

    return res.status(201).json({ comment });
  } catch (error) {
    console.error("Error creating comment:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

async function populateReplies(comment) {
  if (comment?.replies && comment?.replies?.length > 0) {
    comment.replies = await Promise.all(
      comment?.replies?.map(async (replyId) => {
        let reply = await Comment.findById(replyId).populate(
          "author",
          "username fullName avatar"
        );
        return populateReplies(reply);
      })
    );
  }
  return comment;
}

export const getCommentsByPostId = async (req, res) => {
  try {
    const { postId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (!postId) {
      return res.status(400).json({ error: "Post ID is required" });
    }

    let comments = await Comment.find({ post: postId })
      .populate("author", "username fullName avatar") // Populate the author's fullname and image
      .sort({ createdAt: -1 }) // Sort comments by createdAt field in descending order (newest first)
      .skip((page - 1) * limit)
      .limit(limit);
    comments = await Promise.all(
      comments.map(async (comment) => {
        return populateReplies(comment);
      })
    );

    return res.status(200).json({ comments });
  } catch (error) {
    console.error("Error fetching comments by post ID:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};


export const getCommentById = async (req, res) => {
  try {
    const { commentId } = req.params;

    // Validation: Ensure commentId is provided
    if (!commentId) {
      return res.status(400).json({ error: "Comment ID is required" });
    }

    const comment = await Comment.findById(commentId);

    // Check if comment exists
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    return res.status(200).json({ comment });
  } catch (error) {
    console.error("Error fetching comment by ID:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const author = req.user.id;

    if (!author) {
      return next(errorHandler(404, "You are not authorized to comment"));
    }

    if (parseInt(req.user.id) !== parseInt(req.body.userId)) {
      return next(errorHandler(404, "You are not authorized to comment"));
    }

    // Validation: Ensure commentId and content are provided
    if (!commentId) {
      return res.status(400).json({ error: "Comment ID is required" });
    }
    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { content },
      { new: true }
    );

    // Check if comment exists
    if (!updatedComment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    return res.status(200).json({ updatedComment });
  } catch (error) {
    console.error("Error updating comment:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    if (!userId) {
      return res
        .status(403)
        .json({ error: "You are not authorized to delete the comment" });
    }

    if (!commentId) {
      return res.status(400).json({ error: "Comment ID is required" });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const post = await Post.findById(comment.post);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    await Comment.findByIdAndDelete(commentId);

    post.numberOfComments -= 1;
    await post.save();

    return res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const likeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    if (!userId) {
      return res
        .status(403)
        .json({ error: "You are not authorized to like the comment" });
    }

    // Find the comment
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    // Check if the user has already liked the comment
    const index = comment.likes.indexOf(userId);
    if (index === -1) {
      // If the user hasn't liked the comment yet, add their id to the likes array
      comment.likes.push(userId);
      comment.numberOfLikes += 1;
      await comment.save();
      return res.status(200).json({ message: "Comment liked successfully" });
    } else {
      // If the user has already liked the comment, remove their id from the likes array
      comment.likes.splice(index, 1);
      comment.numberOfLikes -= 1;
      await comment.save();
      return res.status(200).json({ message: "Comment unliked successfully" });
    }
  } catch (error) {
    console.error("Error liking/unliking comment:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const MAX_DEPTH = 5;
export const replyToComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const author = req.user.id;

    // Find the parent comment or reply
    const parentCommentOrReply = await Comment.findById(commentId);
    if (!parentCommentOrReply) {
      return next(errorHandler(404, "Comment or reply not found"));
    }

    // Check the depth of the comment thread
    if (parentCommentOrReply.depth >= MAX_DEPTH) {
      return next(errorHandler(400, "Maximum comment depth reached"));
    }

    // Create the reply comment or reply
    const replyCommentOrReply = await Comment.create({
      content,
      author,
      post: parentCommentOrReply.post,
      parentComment: commentId,
      depth: parentCommentOrReply.depth + 1,
    });

    // Add the reply to the parent comment's or reply's replies array
    parentCommentOrReply.replies.push(replyCommentOrReply.id);
    await parentCommentOrReply.save();

    return res.status(201).json({ replyCommentOrReply });
  } catch (error) {
    console.error("Error replying to comment or reply:", error);
    return next(errorHandler(500, "Internal Server Error"));
  }
};

export const getPostByRepliedComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    if (!commentId) {
      return res.status(400).json({ error: "Comment ID is required" });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const post = await Post.findById(comment.post);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    return res.status(200).json({ post });
  } catch (error) {
    console.error("Error fetching post by replied comment:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getReplies = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    let comment = await Comment.findById(commentId).populate("replies");
    comment = await populateReplies(comment);

    const replies = comment.replies.slice((page - 1) * limit, page * limit);

    return res.status(200).json({
      replies,
      totalPages: Math.ceil(comment.replies.length / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching replies with pagination:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// async function populateReplies(comment, depth = 0) {
//   if (depth < 5 && comment.replies && comment.replies.length > 0) {
//     comment.replies = await Promise.all(
//       comment.replies.map(async (reply) => {
//         let replyDoc = await Comment.findById(reply._id).populate("replies");
//         return populateReplies(replyDoc, depth + 1);
//       })
//     );
//   }
//   return comment;
// }
