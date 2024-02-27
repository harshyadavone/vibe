import { Link } from "react-router-dom";
import PostStats from "../shared/PostStats";
import { useSelector } from "react-redux";
import { formatTimeAgo } from "../helpers/convertdatestring";
import { motion, useAnimation } from "framer-motion";
import { useEffect, useRef } from "react";

const PostCard = ({ post }) => {
  const { currentUser } = useSelector((state) => state.user);
  const { theme } = useSelector((state) => state.theme);
  const postRef = useRef(null);

  // Define background color based on theme
  const bgColor = theme === "light" ? "#EFEFEF" : "#1F1F22";

  // Define text color based on theme
  const textColor = theme === "light" ? "#1F1F22" : "#FFFFFF";

  // Define tag color based on theme
  const tagColor = theme === "light" ? "#5C5C7B" : "#7878A3";

  // Control animation
  const controls = useAnimation();

  useEffect(() => {
    controls.start({ opacity: 1, y: 0 });
  }, [controls]);

  const handleClick = () => {
    postRef.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.div
      ref={postRef}
      className="post-card"
      style={{
        backgroundColor: bgColor,
        color: textColor,
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={controls}
      onClick={handleClick}
    >
      <div className="flex-between">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${post?._id}`}>
            <img
              src={
                post?.author?.avatar || "/assets/icons/profile-placeholder.svg"
              }
              alt="owner"
              className="w-12 lg:h-12 rounded-full"
            />
          </Link>

          <div className="flex flex-col">
            <p
              className="base-medium lg:body-bold"
              style={{ color: textColor }}
            >
              {post?.author?.fullName}
            </p>
            <div className="flex-center gap-2" style={{ color: tagColor }}>
              <p className="subtle-semibold lg:small-regular">
                {formatTimeAgo(post.createdAt)}
              </p>
              •
              <p className="subtle-semibold lg:small-regular">
                {post.location}
              </p>
            </div>
          </div>
        </div>

        <Link
          to={`/update-post/${post._id}`}
          className={`${
            currentUser && currentUser._id === post?.author?._id ? "" : "hidden"
          }`}
        >
          <img
            src={"/assets/icons/edit.svg"}
            alt="edit"
            width={20}
            height={20}
          />
        </Link>
      </div>

      <Link to={`/posts/${post._id}`}>
        <div className="small-medium lg:base-medium py-5">
          <p>{post.caption}</p>
          <ul className="flex gap-1 mt-2">
            {post.tags.map((tag, index) => (
              <li
                key={`${tag}${index}`}
                style={{ color: tagColor }}
                className="text-light-3 small-regular"
              >
                #{tag}
              </li>
            ))}
          </ul>
        </div>

        <motion.img
          src={post.image || "/assets/icons/profile-placeholder.svg"}
          alt="post image"
          className="post-card_img"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
      </Link>

      <PostStats post={post} userId={currentUser?._id} />
    </motion.div>
  );
};

export default PostCard;
