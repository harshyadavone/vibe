import React, { useState } from "react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../../firebase";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const PostForm = ({ post, action }) => {
  const [file, setFile] = useState(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [formData, setFormData] = useState({});
  const [publishError, setPublishError] = useState(null);
  const [imagePlaceholderVisible, setImagePlaceholderVisible] = useState(true);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [creatingPost, setCreatingPost] = useState(false);
  const { currentUser } = useSelector((state) => state.user);
  const { theme } = useSelector((state) => state.theme);

  const navigate = useNavigate();

  const handleImageClick = () => {
    // When the image is clicked, trigger the file input click event
    document.getElementById("fileInput").click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Disable the button while creating the post
    setCreatingPost(true);

    if (!currentUser || !currentUser._id) {
      setPublishError("User is not authenticated");
      toast.error("User is not authenticated");
      setCreatingPost(false); // Enable the button again
      return;
    }

    if (!formData.caption) {
      setPublishError("Please add a caption");
      toast.error("Please add a caption");
      setCreatingPost(false); // Enable the button again
      return;
    }

    if (!uploadedImageUrl) {
      setPublishError("Please upload an image");
      toast.error("Please upload an image");
      setCreatingPost(false); // Enable the button again
      return;
    }
    try {
      const res = await fetch("/api/post/createpost", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        setPublishError(data.message);
        setCreatingPost(false); // Enable the button again
        return;
      }
      if (res.ok) {
        setPublishError(null);
        navigate(`/`);
        toast.success("Post created successfully"); // Show success toast
      }
    } catch (error) {
      setPublishError("Something went wrong!");
      setCreatingPost(false); // Enable the button again
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    setFile(selectedFile);
    setFormData({ ...formData, file: selectedFile });
    setImagePlaceholderVisible(false);

    // Trigger image upload
    handleUploadImage(selectedFile);
  };

  const handleUploadImage = async (selectedFile) => {
    try {
      if (!selectedFile) {
        setImageUploadError("Please select an image");
        toast.error("Please select an image");
        return;
      }
      setImageUploadError(null);
      const storage = getStorage(app);
      const fileName = new Date().getTime() + "-" + selectedFile.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, selectedFile);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setImageUploadProgress(progress.toFixed(0));
        },
        (error) => {
          setImageUploadError("Image upload failed");
          setImageUploadProgress(null);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setImageUploadError(null);
            setImageUploadProgress(null);
            setUploadedImageUrl(downloadURL);
            toast.success("Image uploaded successfully");

            // Include the image URL in the formData object
            setFormData({
              ...formData,
              image: downloadURL,
            });
          });
        }
      );
    } catch (error) {
      setImageUploadError("Image upload failed");
      setImageUploadProgress(null);
      console.log(error);
    }
  };

  return (
    <form
      className="flex flex-col gap-4 w-full mx-auto"
      onSubmit={handleSubmit}
    >
      {/* Container for the image */}
      <div
        className={`flex flex-col items-center max-w-2xl rounded-lg p-5  `}
        style={{ height: "300px" }}
      >
        {/* Show image placeholder or uploaded image */}
        {imagePlaceholderVisible ? (
          <span className="tooltip tooltip-bottom " data-tooltip="Bottom">
            <img
              src="/assets/icons/file-upload.svg"
              alt="Image Placeholder"
              className="h-[200px] cursor-pointer mx-auto items-center pt-10 rounded-lg "
              onClick={() => document.getElementById("fileInput").click()} // Trigger file input click
            />
            <div className="pt-2">
              <span className="font-semibold text-gray-500 btn btn-ghost text-center ">
                click on the image to upload
              </span>
            </div>
          </span>
        ) : (
          uploadedImageUrl && (
            <img
              className="h-[260px] cursor-pointer rounded-lg object-cover
              "
              src={uploadedImageUrl}
              alt="Uploaded Image"
              onClick={handleImageClick}
            />
          )
        )}

        {/* Input for choosing file */}
        <input
          id="fileInput"
          type="file"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      {imageUploadProgress !== null && (
        <div className="flex items-center gap-2">
          <svg
            className="spinner-ring spinner-sm"
            viewBox="25 25 50 50"
            strokeWidth="5"
          >
            <circle cx="50" cy="50" r="20" />
          </svg>
          <p>Uploading: {imageUploadProgress}%</p>
        </div>
      )}

      <div className="form-field max-w-2xl RemoveScrollBar">
        <label htmlFor="Caption" className="form-label mb-1">
          Caption
        </label>
        <textarea
          id="Caption"
          onChange={(e) => {
            setFormData({ ...formData, caption: e.target.value });
          }}
          rows={1}
          className="textarea-block textarea"
          placeholder="Caption here "
        />
      </div>

      <div className="form-field max-w-2xl">
        <label htmlFor="tagsInput" className="form-label">
          Add location
        </label>
        <input
          id="location"
          onChange={(e) => {
            setFormData({ ...formData, location: e.target.value });
          }}
          className="input-block input"
          placeholder="Block"
        />
      </div>

      <div className="form-field max-w-2xl">
        <label htmlFor="tagsInput" className="form-label">
          Tags
        </label>
        <input
          id="tagsInput"
          onChange={(e) =>
            setFormData({
              ...formData,
              tags: e.target.value.split(",").map((tag) => tag.trim()),
            })
          }
          className="input-block input"
          placeholder="Tags (separated by commas)"
        />
      </div>

      <div className="flex gap-4 items-center max-w-2xl justify-end">
        <button type="button" className="btn ">
          <Link to={"/"}>Cancel</Link>
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={creatingPost}
        >
          {creatingPost ? (
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            "Create Post"
          )}
        </button>
      </div>
    </form>
  );
};

export default PostForm;
