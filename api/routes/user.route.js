import express from "express";
import {
  addSocialLink,
  deleteProfile,
  followUser,
  getFollowers,
  getFollowing,
  getLikedPosts,
  getProfile,
  getSaved,
  getUserComments,
  getUserPosts,
  removeSocialLink,
  savePost,
  signout,
  unfollowUser,
  unsavePost,
  updateProfile,
  updateSocialLink,
} from "../controllers/user.controller.js";
import { verifyToken } from "../utils/verifyuser.js";

const router = express.Router();

router.post("/signout", verifyToken, signout);
router.post("/user/save", savePost);
router.post("/user/unsave", unsavePost);
router.get("/:userId/savedPosts", getSaved);

router.get("/getuser/:userId", getProfile);
router.get("/getlikedposts/:userId", getLikedPosts);
router.put("/update/:userId", verifyToken, updateProfile);
router.delete("/delete/:userId", verifyToken, deleteProfile);
router.post("/:userId/follow", verifyToken, followUser);
router.post("/:userId/unfollow", verifyToken, unfollowUser);
router.get("/:userId/posts", getUserPosts);
router.get("/:userId/comments", getUserComments);
router.post(":id/social-links", addSocialLink);
router.put("/:id/social-links/:platform", updateSocialLink);
router.delete("/:id/social-links/:platform", removeSocialLink);
router.get("/:userId/followers", getFollowers);
router.get("/:userId/following", getFollowing);

export default router;
