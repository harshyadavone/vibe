import express from "express";

import { verifyToken } from "../utils/verifyuser.js";
import {
  createpost,
  deletePost,
  getPostById,
  getSavedPosts,
  getSearchResults,
  getposts,
  likePost,
  updatePost,
} from "../controllers/post.controller.js";

const router = express.Router();

router.post("/createpost", verifyToken, createpost);
router.get("/getposts", getposts);
router.get("/getpostbyid/:id", getPostById);
router.get("/savedposts/:id", getSavedPosts);
router.put("/likePost/:postId", verifyToken, likePost);
router.delete("/deletepost/:postId", verifyToken, deletePost);
router.put("/updatepost/:postId", verifyToken, updatePost);
router.get("/search", getSearchResults);

export default router;
