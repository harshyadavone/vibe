import React, { useState } from "react";
import axios from "axios"; // make sure to install this package
import { FaInstagram, FaGithub, FaTwitter } from "react-icons/fa"; // import the icons you need
import { Link, useParams } from "react-router-dom";

const SocialLinks = () => {
  const [links, setLinks] = useState({});
  const { id: userId } = useParams();

  const updateLink = async (platform, link) => {
    try {
      const response = await axios.put(
        `/api/user/${userId}/social-links/${platform}`,
        { link }
      );
      setLinks(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleInputChange = (e, platform) => {
    const { value } = e.target;
    setLinks((prevLinks) => ({
      ...prevLinks,
      [platform]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await Promise.all(
        Object.entries(links).map(([platform, link]) =>
          updateLink(platform, link)
        )
      );
      console.log("Links updated successfully!");
    } catch (error) {
      console.error("Error updating links:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-social flex flex-col gap-3">
      <div className="relative">
        <input
          className="input pl-10"
          placeholder="Instagram"
          value={links.instagram || ""}
          onChange={(e) => handleInputChange(e, "instagram")}
        />
        <FaInstagram className="absolute left-3 top-1/2 transform -translate-y-1/2" />
      </div>
      <div className="relative">
        <input
          className="input pl-10"
          placeholder="GitHub"
          value={links.github || ""}
          onChange={(e) => handleInputChange(e, "github")}
        />
        <FaGithub className="absolute left-3 top-1/2 transform -translate-y-1/2" />
      </div>
      <div className="relative">
        <input
          className="input pl-10"
          placeholder="Twitter"
          value={links.twitter || ""}
          onChange={(e) => handleInputChange(e, "twitter")}
        />
        <FaTwitter className="absolute left-3 top-1/2 transform -translate-y-1/2" />
      </div>
      <button type="submit" className="btn btn-primary w-full">
        Save
      </button>
      <Link to={`/profile/${userId}`} className="btn btn-neutral w-full">
        Cancel
      </Link>
    </form>
  );
};

export default SocialLinks;
