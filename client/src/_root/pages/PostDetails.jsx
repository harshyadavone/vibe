import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useQuery } from "react-query";
import axios from "axios";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { formatTimeAgo } from "../../components/helpers/convertdatestring";
import PostStats from "../../components/shared/PostStats";
import { useNavigate } from "react-router-dom";
import { app } from "../../firebase";
import { getStorage, ref, deleteObject } from "firebase/storage";
import { toast } from "react-hot-toast";
import ConfirmationModal from "../../components/shared/ConfirmationModel";
import SidebarDrawer from "../../components/shared/SidebarDrawer";
import { motion } from "framer-motion";

const fetchPostById = async (postId) => {
  const response = await axios.get(`/api/post/getpostbyid/${postId}`);
  return response.data.post;
};

const PostDetails = () => {
  const { currentUser } = useSelector((state) => state.user);
  const { theme } = useSelector((state) => state.theme);
  const navigate = useNavigate();

  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false); // State to control visibility of image modal
  const [selectedImage, setSelectedImage] = useState(null); // State to store the selected image

  const location = useLocation();
  const postId = location.pathname.split("/").pop();

  const {
    data: post,
    isLoading,
    isError,
    refetch,
  } = useQuery(["post", postId], () => fetchPostById(postId), {
    staleTime: 1000 * 60 * 5, // Data will be fresh for 5 minutes
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    refetch();
  }, [location, refetch]);

  const handleDeletePost = async () => {
    try {
      setIsDeleting(true);
      if (!post) {
        console.error("Post is not loaded yet.");
        return;
      }

      await axios.delete(`/api/post/deletepost/${postId}`);

      const storage = getStorage(app);
      const postImageRef = ref(storage, post.image);
      await deleteObject(postImageRef);

      navigate("/");
      toast.success("Post deleted successfully");
    } catch (error) {
      console.error("Error removing post:", error.message);
      toast.error("Error deleting post");
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmDelete = () => {
    setShowConfirmationModal(false);
    handleDeletePost();
  };

  const cancelDelete = () => {
    setShowConfirmationModal(false);
  };

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
  };

  const bgColor = theme === "light" ? "#EFEFEF" : "#1F1F22";
  const textColor = theme === "light" ? "#1F1F22" : "#FFFFFF";
  const tagColor = theme === "light" ? "#5C5C7B" : "#7878A3";

  return (
    <div className="post_details-container">
      <ConfirmationModal
        show={showConfirmationModal}
        confirmAction={confirmDelete}
        cancelAction={cancelDelete}
      />

      {/* Image Modal */}
      {showImageModal && (
        <div className="image-modal-overlay" onClick={closeImageModal}>
          <div className="image-modal">
            <img src={selectedImage} alt="post" className="modal-image" />
          </div>
        </div>
      )}

      <div
        className="hidden md:flex max-w-5xl w-full"
        style={{ backgroundColor: bgColor, color: textColor }}
      ></div>

      {isLoading || !post ? (
        <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="blue"
            strokeWidth="4"
            fill="transparent"
          >
            <animate
              attributeName="r"
              from="45"
              to="45"
              begin="0s"
              dur="2s"
              values="45;10;45"
              repeatCount="indefinite"
            />
            <animate
              attributeName="stroke-opacity"
              from="1"
              to="1"
              begin="0s"
              dur="2s"
              values="1;.1;1"
              repeatCount="indefinite"
            />
          </circle>
        </svg>
      ) : (
        <div
          className="post_details-card"
          style={{ backgroundColor: bgColor, color: textColor }}
        >
          <motion.img
            src={post?.image}
            alt="creator"
            className="post_details-img"
            onClick={() => openImageModal(post?.image)} // Open image modal when image is clicked
            initial={{ opacity: 0, scale: 0.9 }} // Initial animation state
            animate={{ opacity: 1, scale: 1 }} // Animation when image is loaded
            transition={{ duration: 0.5 }} // Animation duration
          />

          <div className="post_details-info">
            <div className="flex-between w-full">
              <Link
                to={`/profile/${post?.userId}`}
                className="flex items-center gap-3"
              >
                <img
                  src={
                    post?.author.avatar ||
                    "/assets/icons/profile-placeholder.svg"
                  }
                  alt="creator"
                  className="w-8 h-8 lg:w-12 lg:h-12 rounded-full"
                />
                <div className="flex gap-1 flex-col">
                  <p className="base-medium lg:body-bold text-light-1">
                    {post?.author.fullName}
                  </p>
                  <div className="flex-center gap-2 text-light-3">
                    <p
                      className="subtle-semibold lg:small-regular "
                      style={{ color: tagColor }}
                    >
                      {formatTimeAgo(post?.createdAt)}
                    </p>
                    •
                    <p
                      className="subtle-semibold lg:small-regular"
                      style={{ color: tagColor }}
                    >
                      {post?.location}
                    </p>
                  </div>
                </div>
              </Link>

              <div className="flex-center gap-4">
                <button
                  onClick={() => setShowConfirmationModal(true)}
                  variant="ghost"
                  className={`post_details-delete-btn ${
                    currentUser?._id !== post.ownerId && "hidden"
                  }`}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
                    <img
                      src={"/assets/icons/delete.svg"}
                      alt="delete"
                      width={24}
                      height={24}
                    />
                  )}
                </button>
              </div>
            </div>
            <hr
              className="border-sm w-full"
              style={{ borderColor: tagColor }}
            />
            <div className="flex flex-col flex-1 w-full small-medium lg:base-regular">
              <p>{post?.caption}</p>
              <ul className="flex gap-1 mt-2">
                {post?.tags.map((tag, index) => (
                  <li
                    key={`${tag}${index}`}
                    className="font-sans small-regular"
                    style={{ color: tagColor }}
                  >
                    #{tag}
                  </li>
                ))}
              </ul>
            </div>
            <SidebarDrawer
              postId={postId}
              numberOfComments={post.numberOfComments}
            />

            <div className="w-full">
              <PostStats post={post} userId={currentUser?._id} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostDetails;
