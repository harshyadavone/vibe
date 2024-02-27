import { Activity } from "lucide-react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { sidebarLinks } from "../../constants";
import "../../globals.css";
import { truncateText } from "../helpers/TruncateText";
import { useDispatch, useSelector } from "react-redux";
import { signoutSuccess } from "../../redux/user/userSlice";
import toast from "react-hot-toast";

const LeftSidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const truncatedFullname = truncateText(currentUser?.fullName, 10);
  const truncatedEmail = truncateText(currentUser?.email, 17);
  const { pathname } = useLocation();

  const handleSignOut = async () => {
    try {
      const res = await fetch("/api/user/signout", {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message);
      } else {
        dispatch(signoutSuccess("User Signed Out"));
        toast.success("Logout Successful");
        navigate("/continue-signin");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };
  return (
    <nav className="hidden md:flex px-6 py-10 flex-col justify-between min-w-[230px]">
      <div className="flex flex-col gap-11">
        <Link to="/" className="flex items-center">
          <Activity alt="logo" className="text-indigo-600 mr-2" />
          <p className="text-lg font-bold text-indigo-600 ">Vibe</p>
        </Link>

        {/* //link to Profile */}
        {!currentUser ? (
          <>
            <Link to={"/continue-signin"} className="btn font-semibold">
              Login
            </Link>
          </>
        ) : (
          <Link
            to={`/profile/${currentUser._id}`}
            className="flex items-center gap-3"
          >
            <img
              className="avatar"
              src={
                currentUser.avatar || "/assets/icons/profile-placeholder.svg"
              }
            />
            <div className="flex flex-col dark:bg-white">
              <p className="body-sm font-semibold truncate-text">
                {truncatedFullname}
              </p>
              <p className="small-regular text-gray-500 truncate">
                {truncatedEmail}
              </p>
            </div>
          </Link>
        )}
        <ul className="flex flex-col gap-4">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.route;
            return (
              <li
                key={link.label}
                className={`leftsidebar-link group hover:text-white ${
                  isActive && "bg-blue-700 text-white"
                }`}
              >
                <NavLink
                  to={link.route}
                  className="flex gap-3 items-center p-3"
                >
                  <img
                    src={link.imgURL}
                    alt={link.label}
                    className={`group-hover:invert-white ${
                      isActive && "invert-white"
                    }`}
                  />
                  {link.label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>
      {!currentUser ? (
        <></>
      ) : (
        <div className="flex items-center pl-4 gap-2 font-bold  rounded p-3 hover:cursor-pointer">
          <img className="h-5" src="/assets/icons/logout.svg" alt="logout" />
          <p className="" onClick={handleSignOut}>
            Log Out
          </p>
        </div>
      )}
    </nav>
  );
};

export default LeftSidebar;
