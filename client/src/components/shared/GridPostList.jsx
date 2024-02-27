import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import PostStats from "./PostStats";
import { motion, AnimatePresence } from "framer-motion";
import Loader from "./Loader";

const GridPostList = ({ posts, showUser = true, showStats = true }) => {
  const { theme } = useSelector((state) => state.theme);

  if (!posts) {
    return (
      <h1>
        <Loader />
      </h1>
    ); // or return a loading indicator or placeholder
  }

  return (
    <ul className="grid-container">
      <AnimatePresence>
        {posts.map((post, index) => (
          <motion.li
            key={post._id}
            className="relative min-w-80 h-80"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
          >
            <Link to={`/posts/${post._id}`} className="grid-post_link">
              <img
                src={post.image}
                alt="post"
                className="h-full w-full object-cover"
              />
            </Link>

            <div className="grid-post_user">
              {showUser && (
                <div className="flex items-center justify-start gap-2 flex-1">
                  <img
                    src={
                      post.author.avatar || "/assets/icons/profile-placeholder.svg"
                    }
                    alt="creator"
                    className="w-8 h-8 rounded-full"
                  />
                  <p
                    className={`line-clamp-1 ${
                      theme === "light" && "dark" && "text-white"
                    }`}
                  >
                    {post.author.fullName}
                  </p>
                </div>
              )}
              {showStats && <PostStats post={post} userId={post.author._id} />}
            </div>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
};

export default GridPostList;
