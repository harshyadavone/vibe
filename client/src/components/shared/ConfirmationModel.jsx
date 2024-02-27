import React from "react";
import { useSelector } from "react-redux";

const ConfirmationModal = ({ show, confirmAction, cancelAction }) => {
  const { theme } = useSelector((state) => state.theme);

  const isLightTheme = theme === "light";
  const modalBgColor = isLightTheme ? "bg-white" : "bg-gray-800";
  const textColor = isLightTheme ? "text-black" : "text-white";

  return (
    <div
      className={`${
        show ? "fixed" : "hidden"
      } inset-0 z-50 overflow-hidden flex justify-center items-center`}
    >
      <div className="fixed inset-0 bg-black opacity-50"></div>
      <div
        className={`w-full max-w-md mx-4 rounded-lg z-50 overflow-auto ${modalBgColor}`}
      >
        <div className="p-6">
          <h2 className={`font-semibold ${textColor}`}>Confirm Deletion</h2>
          <p className={`subtle-regular mb-6 ${textColor}`}>
            Are you sure you want to delete this post?
          </p>
          <div className="flex justify-end">
            <button
              onClick={confirmAction}
              className="px-4 py-2 rounded mr-2 bg-red-500 text-white "
            >
              Delete
            </button>
            <button
              onClick={cancelAction}
              className={`btn btn-ghost px-4 py-2 rounded  `}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
