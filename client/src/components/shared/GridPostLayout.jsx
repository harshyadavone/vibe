import React from "react";

const GridPostLayout = () => {
  return (
    <div>
      <div className="pt-10 pl-5">
        <div className="grid-container">
          {Array(6)
            .fill()
            .map((_, index) => (
              <div key={index} className="relative min-w-80 h-80">
                <div className="skeleton-pulse h-full w-full rounded-[24px]"></div>
                <div className="grid-post_user">
                  <div className="flex items-center justify-start gap-2 flex-1">
                    <div className="skeleton-pulse w-8 h-8 rounded-full"></div>
                    <div className="skeleton-pulse w-32 h-5 rounded-md"></div>
                  </div>
                  <div className="skeleton-pulse w-24 h-5 rounded-md"></div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default GridPostLayout;
