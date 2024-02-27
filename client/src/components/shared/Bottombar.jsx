import React from "react";
import { Link, useLocation, NavLink } from "react-router-dom";
import { bottombarLinks } from "../../constants";

const Bottombar = () => {
  const { pathname } = useLocation();
  return (
    <div className="bottom-bar">
      {bottombarLinks.map((link) => {
        const isActive = pathname === link.route;
        return (
          <Link
            to={link.route}
            key={link.label}
            className={` ${
              isActive && "bg-blue-700 rounded-[10px]"
            } flex-center flex-col gap-1 p-2 transition`}
          >
            <img
              src={link.imgURL}
              alt={link.label}
              height={16}
              width={16}
              className={`${isActive && "invert-white"}`}
            />
            <p className={`tiny-medium ${isActive && "invert-white"}`}>{link.label}</p>
          </Link>
        );
      })}
    </div>
  );
};

export default Bottombar;
