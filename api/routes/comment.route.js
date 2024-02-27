/**
 * This file contains the routes for creating, retrieving, updating, and deleting comments and replies.
 * @author Harsh Yadav
 * @Date 22/02/2024
 */

import express from "express";
import {
  createComment,
  getCommentsByPostId,
  getCommentById,
  updateComment,
  deleteComment,
  replyToComment,
  likeComment,
  getPostByRepliedComment,
  getReplies,
} from "../controllers/comment.controller.js";
import { verifyToken } from "../utils/verifyuser.js";
const router = express.Router();
router.post("/:postId/createcomment", verifyToken, createComment);
router.get("/:postId/comments", getCommentsByPostId);
router.get("/:commentId", getCommentById);
router.put("/updatecomment/:commentId", verifyToken, updateComment);
router.delete("/deletecomment/:commentId", verifyToken, deleteComment);
router.post("/:commentId/like", verifyToken, likeComment);
router.post("/:commentId/reply", verifyToken, replyToComment);
router.get(
  "/:commentId/getPostByRepliedComment",
  verifyToken,
  getPostByRepliedComment
);
router.get("/:commentId/replies", getReplies);

export default router;
