// FollowButton.js
import React from 'react';
import { useFollowUser, useUnfollowUser } from "../../queries/UseFollowUser";

const FollowButton = ({ userData, currentUser, isFollowing, setIsFollowing, setUserData, size }) => {
  const {
    mutate: followUser,
    isLoading: isFollowPending,
    isError: isFollowError,
  } = useFollowUser(userData);
  const {
    mutate: unfollowUser,
    isLoading: isUnfollowPending,
    isError: isUnfollowError,
  } = useUnfollowUser(userData);

  const handleFollow = () => {
    if ((userData, currentUser._id)) {
      followUser(userData, currentUser._id);
      setIsFollowing(true);
      setUserData((prevData) => ({
        ...prevData,
        followers: [...prevData.followers, currentUser._id],
      }));
    }
  };

  const handleUnfollow = () => {
    if ((userData, currentUser._id)) {
      unfollowUser(userData, currentUser._id);
      setIsFollowing(false);
      setUserData((prevData) => ({
        ...prevData,
        followers: prevData.followers.filter(
          (followerId) => followerId !== currentUser._id
        ),
      }));
    }
  };

  const btnClass = size === 'sm' ? 'btn btn-sm btn-primary' : 'btn btn-primary';

  return (
    <>
      {isFollowing ? (
        <button
          className={btnClass}
          onClick={handleUnfollow}
          disabled={isUnfollowPending}
        >
          {isUnfollowPending ? "Loading..." : "Unfollow"}
        </button>
      ) : (
        <button
          className={btnClass}
          onClick={handleFollow}
          disabled={isFollowPending}
        >
          {isFollowPending ? "Loading..." : "Follow"}
        </button>
      )}
      {(isFollowError || isUnfollowError) && (
        <p className="btn btn-error">Something went wrong</p>
      )}
    </>
  );
};

export default FollowButton;
