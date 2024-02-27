import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Activity } from "lucide-react";

import { useDispatch, useSelector } from "react-redux";
import { signoutSuccess } from "../../redux/user/userSlice";
import toast from "react-hot-toast";

const Topbar = () => {
  const { currentUser } = useSelector((state) => state.user);

  const dispatch = useDispatch();
  const navigate = useNavigate();

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
    <section className="sticky top-0 z-50 md:hidden w-full">
      <div className="flex justify-between items-center py-3 px-5">
        <Link>
          <Activity
            alt="logo"
            className="h-7 w-auto text-indigo-600"
            onClick={() => {
              navigate("/");
            }}
          />
        </Link>
        <div>
          {!currentUser ? (
            <>
              <Link
                to={"/continue-signin"}
                className="btn btn-md btn-ghost font-semibold"
              >
                Login
              </Link>
            </>
          ) : (
            <div className="flex gap-5">
              <button className="flex items-center pl-4 gap-2 ">
                <img
                  onClick={handleSignOut}
                  className="h-5"
                  src="/assets/icons/logout.svg"
                  alt="logout"
                />
              </button>
              <Link to={`/profile/${currentUser._id}`}>
                <img
                  className="avatar h-9 w-9 object-cover flex-center gap-3 "
                  src={
                    currentUser.avatar ||
                    "/assets/icons/profile-placeholder.svg"
                  }
                />
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Topbar;
