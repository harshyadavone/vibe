import React, { useRef, useEffect } from "react";
import CommentSection from "./CommentSection";

const SidebarDrawer = ({ postId, numberOfComments }) => {
  const sidebarRef = useRef(null);

  const handleOpenComments = () => {
    if (sidebarRef.current) {
      const scrollOptions = {
        top: sidebarRef.current.scrollHeight,
        behavior: "smooth", // Smooth scrolling behavior
      };
      sidebarRef.current.scrollTo(scrollOptions);
    }
  };

  // Function to handle outside click
  const handleClickOutside = (event) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      document.getElementById("drawer-overlay").checked = false;
    }
  };

  // Adding the event listener when the component mounts and removing it when it unmounts
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  });

  return (
    <div>
      <input type="checkbox" id="drawer-overlay" className="drawer-toggle" />
      <label
        htmlFor="drawer-overlay"
        className="btn btn-primary"
        onClick={handleOpenComments}
      >
        Open Comment Section
      </label>
      <label className="overlay hide-scrollbar scrollbar-hidden"></label>
      <div className="drawer max-w-3xl" ref={sidebarRef}>
        <div className="drawer-content pt-10 flex flex-col h-full justify-between relative">
          <label
            htmlFor="drawer-overlay"
            className="btn btn-sm btn-circle btn-ghost absolute top-0  right-4"
          >
            ✕
          </label>
          {/* Place your content here */}
          <CommentSection postId={postId} numberOfComments={numberOfComments} />
          <label
            htmlFor="drawer-overlay"
            className="btn btn-sm btn-circle btn-ghost absolute bottom-5 right-5"
          >
            ✕
          </label>
        </div>
      </div>
    </div>
  );
};

export default SidebarDrawer;
