import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useMutation } from "react-query";
import axios from "axios"; // Import Axios
import { toast } from "react-hot-toast";

const PostStats = ({ post }) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    // Initialize component state based on post and current user
    setLiked(post?.likes?.some((like) => like.userId === currentUser?._id));
    setLikesCount(post?.numberOfLikes);
    setSaved(post?.savedBy?.includes(currentUser?._id));
  }, [post, currentUser]);

  // Define Axios instance
  const axiosInstance = axios.create({
    baseURL: "/api", // Assuming your API base URL is /api
    headers: {
      "Content-Type": "application/json",
    },
  });

  // React Query hook for handling post like mutation
  const likeMutation = useMutation(
    () =>
      axiosInstance.put(`/post/likePost/${post._id}`, {
        name: currentUser.fullName,
        pic: currentUser.avatar,
      }),
    {
      onSuccess: (data) => {
        setLiked(!liked);
        // Calculate the updated likes count
        const updatedLikesCount = liked ? likesCount - 1 : likesCount + 1;
        setLikesCount(updatedLikesCount);
        toast.success(liked ? "Post unliked!" : "Post liked!");
      },
      onError: (error) => {
        console.error("Error liking post:", error.message);
        toast.error("Failed to like post!");
      },
    }
  );

  // React Query hook for handling post save mutation
  // React Query hook for handling post save mutation
  const saveMutation = useMutation(
    () =>
      axiosInstance.post(`/user/user/save`, {
        userId: currentUser._id,
        postId: post._id,
      }),
    {
      onSuccess: (data) => {
        setSaved(true);
        toast.success("Post saved!");
      },
      onError: (error) => {
        console.error("Error saving post:", error.message);
        toast.error("Failed to save post!");
      },
    }
  );

  // React Query hook for handling post unsave mutation
  const unsaveMutation = useMutation(
    () =>
      axiosInstance.post(`/user/user/unsave`, {
        userId: currentUser._id,
        postId: post._id,
      }),
    {
      onSuccess: (data) => {
        setSaved(false);
        toast.success("Post unsaved!");
      },
      onError: (error) => {
        console.error("Error unsaving post:", error.message);
        toast.error("Failed to unsave post!");
      },
    }
  );

  // Handler functions
  const handleLike = () => {
    if (!currentUser) {
      navigate("/continue-signin");
      return;
    }
    likeMutation.mutate();
  };

  const handleSave = () => {
    if (!currentUser) {
      navigate("/continue-signin");
      return;
    }
    if (saved) {
      unsaveMutation.mutate();
    } else {
      saveMutation.mutate();
    }
  };

  return (
    <div className="flex justify-between items-center z-20">
      <div className="flex gap-2 mr-5">
        <img
          src={liked ? "/assets/icons/liked.svg" : "/assets/icons/like.svg"}
          alt="like"
          height={20}
          width={20}
          onClick={handleLike}
          className="cursor-pointer"
        />
        <p className="small-medium lg:base-medium">{likesCount}</p>
      </div>
      <div className="flex gap-2">
        <img
          src={saved ? "/assets/icons/saved.svg" : "/assets/icons/save.svg"}
          alt="save"
          height={20}
          width={20}
          onClick={handleSave}
          className="cursor-pointer "
        />
      </div>
    </div>
  );
};

export default PostStats;
