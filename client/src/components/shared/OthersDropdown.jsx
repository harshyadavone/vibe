import React from "react";
import { Send, Github, GripHorizontal, AtSign, Twitter } from "lucide-react";
import { Link } from "react-router-dom";

const OthersDropdown = ({ userId, socialLinks }) => {
  return (
    <div>
      <div className="dropdown">
        <label className="btn btn-primary px-8" tabIndex="0">
          <GripHorizontal className="w-5 h-5" />
          Others
        </label>
        <div className="dropdown-menu">
          <Link
            // to={`/message/${userId}`}
            className="dropdown-item flex flex-row gap-3 text-sm"
          >
            {" "}
            <Send className="h-5 w-5" /> message
          </Link>
          {socialLinks?.github ? (
            <Link
              to={`https://www.github.com/${socialLinks.github}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div
                tabIndex="-1"
                className="dropdown-item flex flex-row gap-3 text-sm"
              >
                <Github className="h-5 w-5 " />
                GitHub
              </div>
            </Link>
          ) : (
            <div className="dropdown-item text-sm">GitHub: Not available</div>
          )}
          {socialLinks?.instagram ? (
            <Link
              to={`https://www.instagram.com/${socialLinks.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div
                tabIndex="-1"
                className="dropdown-item flex flex-row gap-3 text-sm"
              >
                <AtSign className="h-5 w-5 " />
                Instagram
              </div>
            </Link>
          ) : (
            <div className="dropdown-item text-sm">
              Instagram: Not available
            </div>
          )}
          {socialLinks?.instagram ? (
            <Link
              to={`https://www.twitter.com/${socialLinks.twitter}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div
                tabIndex="-1"
                className="dropdown-item flex flex-row gap-3 text-sm"
              >
                <Twitter className="h-5 w-5 " />
                Twitter
              </div>
            </Link>
          ) : (
            <div className="dropdown-item text-sm">Twitter: Not available</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OthersDropdown;
