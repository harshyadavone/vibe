// ProfileStats.js
import React from "react";
import { Link } from "react-router-dom";

const StatBlock = ({ value, label }) => (
  <div className="flex-center gap-2">
    <p className="small-semibold lg:body-bold text-primary-500">{value}</p>
    <p className="small-medium lg:base-medium text-light-2">
      {value > 1 ? `${label}s` : label}
    </p>
  </div>
);

const ProfileStats = ({ userData }) => {
  return (
    <div className="flex gap-8 items-center justify-center xl:justify-start flex-wrap z-20">
      <Link to={`/followers/${userData._id}`}>
        <StatBlock value={userData.followers.length} label="Follower" />
      </Link>
      <Link to={`/following/${userData._id}`}>
        <StatBlock value={userData.following.length} label="Following" />
      </Link>
    </div>
  );
};

export default ProfileStats;
