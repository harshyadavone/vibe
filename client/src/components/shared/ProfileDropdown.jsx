import React from "react";
import MyAwesomeThemeComponent from "./ThemeToggleComponent";
import { SunMoon, Bolt, Link2, Wrench } from "lucide-react";
import { Link } from "react-router-dom";

const ProfileDropdown = ({ userId }) => {
  return (
    <div>
      <div className="dropdown">
        <label className="btn btn-primary px-8" tabIndex="0">
          <Bolt className="w-5 h-5" />
          Settings
        </label>
        <div className="dropdown-menu">
          <Link
            to={`/profile/${userId}/social-links`}
            className="dropdown-item flex flex-row gap-3 text-sm"
          >
            {" "}
            <Link2 className="h-5 w-5" /> Social-Links
          </Link>
          <div
            tabIndex="-1"
            className="dropdown-item flex flex-row gap-3 text-sm"
          >
            <Wrench className="h-5 w-5 " />
            Account settings
          </div>
          <div
            tabIndex="-1"
            className=" pl-2 pb-1 pt-2 flex flex-row items-center flex-between pr-3 text-sm"
          >
            <div className="flex flex-row gap-3">
              <SunMoon className="w-5 h-5 " />
              <span>Theme</span>
            </div>
            <MyAwesomeThemeComponent />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDropdown;
