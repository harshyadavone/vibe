import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion"; // Import motion from Framer Motion
import { toggleTheme } from "../../redux/theme/ThemeSlice";

function MyAwesomeThemeComponent() {
  const theme = useSelector((state) => state.theme.theme);
  const dispatch = useDispatch();

  const toggleThemeHandler = () => {
    dispatch(toggleTheme());
  };

  // Apply the theme to the HTML tag when the theme changes
  useEffect(() => {
    document.querySelector("html").setAttribute("data-theme", theme);
    // Store the theme preference in local storage
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Retrieve the theme preference from local storage when the component mounts
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme !== theme) {
      // Dispatch toggleTheme only if the stored theme differs from the current theme
      dispatch(toggleTheme());
    }
  }, [dispatch, theme]);

  return (
    <div>
      <motion.button
        onClick={toggleThemeHandler}
        style={{
          backgroundColor: theme === "light" ? "#E2E8F0" : "#4A5568",
          color: "#FFFFFF",
          border: "none",
          padding: "3px", // reduced padding
          borderRadius: "15px", // reduced border radius
          cursor: "pointer",
          outline: "none",
          position: "relative",
          width: "50px", // reduced width
          height: "25px", // reduced height
        }}
      >
        <motion.div
          style={{
            width: "15px", // reduced width
            height: "15px", // reduced height
            background: "#4299E1",
            borderRadius: "50%",
            position: "absolute",
            top: "50%",
            left: theme === "light" ? "3px" : "calc(100% - 20px - 3px)", // adjusted left position
            transition: "0.2s",
            transform: "translateY(-50%)",
          }}
        ></motion.div>
      </motion.button>
    </div>
  );
}

export default MyAwesomeThemeComponent;
