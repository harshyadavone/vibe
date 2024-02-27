import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import FollowButton from "../../components/shared/FollowButton";
import { useEffect, useState } from "react";

const UserCard = ({ user }) => {
  const { currentUser } = useSelector((state) => state.user);
  const [isFollowing, setIsFollowing] = useState(false);
  const [userData, setUserData] = useState(user);

  useEffect(() => {
    setIsFollowing(user.followers.includes(currentUser._id));
  }, [user, currentUser._id]);

  return (
    <div className="flex items-center space-x-4">
      <Link to={`/profile/${user._id}`} className="flex-shrink-0">
        <img
          src={user.avatar || "/assets/icons/profile-placeholder.svg"}
          alt="creator"
          className="w-10 h-10 rounded-full"
        />
      </Link>

      <div className="flex-grow min-w-0">
        <Link to={`/profile/${user._id}`} className="text-sm font-medium">
          <p className="truncate">{user.fullName}</p>
        </Link>
        <p className="text-sm text-gray-500 truncate">@{user.username}</p>
      </div>

      <FollowButton
        size={"sm"}
        userData={userData}
        currentUser={currentUser}
        isFollowing={isFollowing}
        setIsFollowing={setIsFollowing}
        setUserData={setUserData}
      />
    </div>
  );
};

export default UserCard;
