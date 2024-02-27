import React from "react";
import { useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";

const ToasterComponent = () => {
  const theme = useSelector((state) => state.theme.theme);

  // Define toast options for both light and dark modes
  const toastOptions = {
    position: "top-center",
    toastOptions: {
      className: theme === "dark" ? "dark-toast" : "light-toast",
      style: {
        background: theme === "dark" ? "#333" : "#f4f4f4", // Adjust background color for light mode
        color: theme === "dark" ? "#fff" : "#333", // Adjust text color for light mode
      },
    },
  };

  return <Toaster {...toastOptions} />;
};

export default ToasterComponent;
