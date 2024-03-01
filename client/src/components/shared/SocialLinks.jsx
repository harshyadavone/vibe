import React, { useState } from "react";
import axios from "axios"; // make sure to install this package
import { FaInstagram, FaGithub, FaTwitter } from "react-icons/fa"; // import the icons you need
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const SocialLinks = () => {
  const [links, setLinks] = useState({});
  const { id: userId } = useParams();
  const navigate = useNavigate();

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
      toast.success("Links updated successfully!");
      navigate(`/profile/${userId}`);
    } catch (error) {
      console.error("Error updating links:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-social flex flex-col gap-3">
      <div className="relative">
        <input
          className="input pl-10"
          placeholder="@instagram"
          value={links.instagram || ""}
          onChange={(e) => handleInputChange(e, "instagram")}
        />
        <FaInstagram className="absolute left-3 top-1/2 transform -translate-y-1/2" />
      </div>
      <div className="relative">
        <input
          className="input pl-10"
          placeholder="@github"
          value={links.github || ""}
          onChange={(e) => handleInputChange(e, "github")}
        />
        <FaGithub className="absolute left-3 top-1/2 transform -translate-y-1/2" />
      </div>
      <div className="relative">
        <input
        id="twitter"
          className="input pl-10"
          placeholder="@twitter"
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
