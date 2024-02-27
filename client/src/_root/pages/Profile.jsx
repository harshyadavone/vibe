import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useLocation, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Routes, Route, Outlet } from "react-router-dom";
import GridPostList from "../../components/shared/GridPostList";
import LikedPosts from "./LikedPosts";
import Loader from "../../components/shared/Loader";
import { useInfiniteQuery } from "react-query";
import { motion } from "framer-motion";
import ProfileDropdown from "../../components/shared/ProfileDropdown";
import ProfileStats from "../../components/shared/ProfieStats";
import FollowButton from "../../components/shared/FollowButton";
import { Navigate } from "react-router-dom";

const StatBlock = ({ value, label }) => (
  <div className="flex-center gap-2">
    <p className="small-semibold lg:body-bold text-primary-500">{value}</p>
    <p className="small-medium lg:base-medium text-light-2">
      {value > 1 ? `${label}s` : label}
    </p>
  </div>
);

const Profile = () => {
  const { id } = useParams();
  const { currentUser } = useSelector((state) => state.user);
  const { pathname } = useLocation();
  const [isFollowing, setIsFollowing] = useState(false); // Add this line
  const [userData, setUserData] = useState(null);

  if (!currentUser) {
    return <Navigate to="/continue-signin" />;
  }

  const fetchPosts = async ({ pageParam = 1 }) => {
    const { data } = await axios.get(
      `/api/user/${id}/posts?page=${pageParam}&limit=6`
    );
    return data;
  };

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isLoading,
    status,
    isFetchingNextPage,
  } = useInfiniteQuery(["userPosts", id], fetchPosts, {
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 60 * 1000,
  },
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userDataResponse, postsData] = await Promise.all([
          axios.get(`/api/user/getuser/${id}`),
          fetchPosts({}), // Fetch initial page of posts
        ]);
        setUserData(userDataResponse.data);
        setIsFollowing(
          userDataResponse.data.followers.includes(currentUser._id)
        );
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [id]);

  if (isLoading)
    return (
      <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
        <Loader />
      </div>
    );

  if (error)
    return (
      <div className="flex-center w-full h-full">
        An error has occurred: {error.message}
      </div>
    );

  const tabVariants = {
    inactive: { opacity: 0.4, scale: 0.9 },
    active: { opacity: 1, scale: 1 },
  };

  if (!userData)
    return (
      <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
        <Loader />
      </div>
    );

  return (
    <div className="profile-container">
      <div className="profile-inner_container">
        <div className="flex xl:flex-row flex-col max-xl:items-center flex-1 gap-7">
          <img
            src={userData.avatar || "/assets/icons/profile-placeholder.svg"}
            alt="profile"
            className="w-28 h-28 lg:h-36 lg:w-36 object-cover rounded-full"
          />
          <div className="flex flex-col flex-1 justify-between md:mt-2">
            <div className="flex flex-col w-full">
              <h1 className="text-center xl:text-left h3-bold md:h1-semibold w-full">
                {userData.fullName || "username"}
              </h1>
              <p className="small-regular md:body-medium text-gray-500 text-center xl:text-left">
                @{userData.username}
              </p>
            </div>

            <div className="flex gap-8 mt-12 items-center justify-center xl:justify-start flex-wrap z-20">
              <StatBlock value={userData.posts.length} label="Post" />
              <ProfileStats userData={userData} />
            </div>

            <p className="small-medium md:base-medium text-center xl:text-left mt-7 max-w-screen-sm">
              {userData?.bio}
            </p>
          </div>

          <div className="flex justify-center gap-4">
            <div className={`${currentUser._id !== userData._id && "hidden"}`}>
              <Link
                to={`/update-profile/${userData._id}`}
                className={`h-12 btn bg-dark-4 px-5 text-light-1 flex-center gap-2 rounded-lg ${
                  currentUser.id !== userData._id && "hidden"
                }`}
              >
                <img
                  src={"/assets/icons/edit.svg"}
                  alt="edit"
                  width={20}
                  height={20}
                />
                <p className="flex whitespace-nowrap small-medium">
                  Edit Profile
                </p>
              </Link>
            </div>
            {currentUser._id !== userData._id && (
              <>
                <FollowButton
                  setUserData={setUserData}
                  userData={userData}
                  currentUser={currentUser}
                  isFollowing={isFollowing}
                  setIsFollowing={setIsFollowing}
                />
              </>
            )}
            {currentUser._id === userData._id ? (
              <div className="">
                <ProfileDropdown userId={userData._id} />
              </div>
            ) : (
              <button className="btn">Message</button>
            )}
          </div>
        </div>
      </div>

      {currentUser._id === userData._id && (
        <div className="flex max-w-5xl w-full ">
          <motion.div
            variants={tabVariants}
            initial="inactive"
            animate={
              pathname === `/profile/${userData._id}` ? "active" : "inactive"
            }
          >
            <Link
              to={`/profile/${userData._id}`}
              className={`profile-tab rounded-l-lg ${
                pathname === `/profile/${userData._id}`
                  ? "active-tab"
                  : "inactive-tab"
              }`}
            >
              <img
                src={"/assets/icons/posts.svg"}
                alt="posts"
                width={20}
                height={20}
              />
              Posts
            </Link>
          </motion.div>
          <motion.div
            variants={tabVariants}
            initial="inactive"
            animate={
              pathname === `/profile/${userData._id}/liked-posts`
                ? "active"
                : "inactive"
            }
          >
            <Link
              to={`/profile/${userData._id}/liked-posts`}
              className={`profile-tab rounded-r-lg ${
                pathname === `/profile/${userData._id}/liked-posts`
                  ? "active-tab"
                  : "inactive-tab"
              }`}
            >
              <img
                src={"/assets/icons/like.svg"}
                alt="like"
                width={20}
                height={20}
              />
              Liked Posts
            </Link>
          </motion.div>
        </div>
      )}

      <Routes>
        <Route
          index
          element={
            <>
              {status === "loading" ? (
                <div>
                  <Loader />
                </div>
              ) : status === "error" ? (
                <span>Error: {error.message}</span>
              ) : (
                <>
                  {data.pages.flatMap((page) => page.posts).length > 0 ? (
                    <GridPostList
                      posts={data.pages.flatMap((page) => page.posts)}
                      showUser={false}
                    />
                  ) : (
                    <h2>There are no posts</h2>
                  )}
                  {hasNextPage && (
                    <div className="">
                      <button
                        className="btn btn-sm"
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                      >
                        {isFetchingNextPage ? (
                          <Loader />
                        ) : hasNextPage ? (
                          "Load More"
                        ) : (
                          "Nothing more to load"
                        )}
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          }
        />
        {currentUser._id === userData.id && (
          <Route
            path="/liked-posts"
            element={<LikedPosts currentUser={userData} />}
          />
        )}
      </Routes>
      <Outlet />
    </div>
  );
};

export default Profile;
