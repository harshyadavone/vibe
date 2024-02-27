import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import Loader from "../../components/shared/Loader";
import {
  updateSuccess,
  updateFailure,
  updateStart,
} from "../../redux/user/userSlice";
import { app } from "../../firebase";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { useDispatch } from "react-redux";
import { toast } from "react-hot-toast";


const UpdateProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentUser, loading } = useSelector((state) => state.user);
  const { theme } = useSelector((state) => state.theme);
  const [imageFile, setImageFile] = useState(null);
  const [imageFileUrl, setImageFileUrl] = useState(null);
  const [imageFileUploadProgress, setImageFileUploadProgress] = useState(null);
  const [imageFileUploadError, setImageFileUploadError] = useState(null);
  const [imageFileUploading, setImageFileUploading] = useState(false);
  const [updateUserSuccess, setUpdateUserSuccess] = useState(null);
  const [updateUserError, setUpdateUserError] = useState(null);
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    fullName: currentUser.fullName,
    username: currentUser.username,
    email: currentUser.email,
    bio: currentUser.bio,
  });
  const filePickerRef = useRef();

  // Define styles based on the selected theme
  const bgColor = theme === "light" ? "#EFEFEF" : "#1F1F22";
  const textColor = theme === "light" ? "#1F1F22" : "#FFFFFF";
  const inputBgColor = theme === "light" ? "bg-white" : "bg-gray-800";
  const inputBorderColor =
    theme === "light" ? "border-gray-300" : "border-gray-700";

  if (!currentUser)
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImageFileUrl(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    if (imageFile) {
      uploadImage();
    }
  }, [imageFile]);

  const uploadImage = async () => {
    setImageFileUploading(true);
    setImageFileUploadError(null);
    const storage = getStorage(app);
    const fileName = new Date().getTime() + imageFile.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, imageFile);

    // Show loading toast with progress
    const loadingToast = toast.loading("Uploading image...", {
      duration: null,
    });

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        // Update loading toast with progress
        toast.update(loadingToast.id, {
          render: `Uploading image... ${progress.toFixed(2)}%`,
          duration: null,
        });
      },
      (error) => {
        setImageFileUploadError(
          "Could not upload image. (file must be less than 2mb)"
        );
        setImageFileUploadProgress(null);
        setImageFile(null);
        setImageFileUrl(null);
        setImageFileUploading(false);
        console.error("Error uploading file:", error);
        // Show error toast
        toast.error("Could not upload image. (file must be less than 2mb)");
        // Dismiss the loading toast
        toast.dismiss(loadingToast.id);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setImageFileUrl(downloadURL);
          setFormData({ ...formData, avatar: downloadURL });
          setImageFileUploading(false);
          // Dismiss the loading toast
          toast.dismiss(loadingToast.id);
          // Show success toast when upload is complete
          toast.success("Image uploaded successfully");
        });
      }
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // Inside the handleSubmit function
  // Inside the handleSubmit function
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateUserError(null);
    setUpdateUserSuccess(null);

    // Check if any fields are changed
    const isDataChanged = Object.keys(formData).some(
      (key) => formData[key] !== currentUser[key]
    );

    if (!isDataChanged) {
      // Show toast for no data changed
      toast.error("No changes detected. Please modify the fields to update.");
      return;
    }

    if (imageFileUploading) {
      setUpdateUserError("Please wait while the image is being uploaded");
      return;
    }

    try {
      dispatch(updateStart());
      // Show loading toast
      const loadingToast = toast.loading("Updating profile...");
      const res = await fetch(`/api/user/update/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        dispatch(updateFailure(data.message));
        setUpdateUserError(data.message);
        // Show error toast
        toast.error(data.message);
      } else {
        dispatch(updateSuccess(data));
        setUpdateUserSuccess("User's profile updated successfully");
        // Show success toast
        toast.success("User's profile updated successfully");
      }
      // Hide loading toast
      toast.dismiss(loadingToast);
      navigate(-1);
    } catch (error) {
      dispatch(updateFailure(error.message));
      setUpdateUserError(error.message);
      // Show error toast
      toast.error(error.message);
    }
  };

  return (
    <div className="flex flex-1">
      <div className="common-container">
        <div className="flex-start gap-3 justify-start w-full max-w-5xl">
          <img
            src="/assets/icons/edit.svg"
            width={36}
            height={36}
            alt="edit"
            className="invert-white"
          />
          <h2 className="text-2xl font-bold text-left w-full">Edit Profile</h2>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-7 w-full mt-4 max-w-5xl"
        >
          <div className="flex">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              ref={filePickerRef}
              hidden
            />
            <div
              className="relative w-32 h-32 self-center cursor-pointer shadow-sm overflow-hidden rounded-full"
              onClick={() => filePickerRef.current.click()}
            >
              <img
                src={imageFileUrl || currentUser.avatar}
                alt="user"
                className="rounded-full w-full h-full object-cover transform transition-all duration-300 hover:scale-110"
              />
            </div>
          </div>

          {imageFileUploadError &&
            console.error("Image Upload Error:", imageFileUploadError)}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              FullName
            </label>
            <div>
              <input
                id="fullName"
                onChange={handleChange}
                type="text"
                className={`mt-1 block w-full py-2 px-3 border ${inputBorderColor} ${inputBgColor} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                defaultValue={currentUser.fullName}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <div>
              <input
                id="username"
                onChange={handleChange}
                type="text"
                className={`mt-1 block w-full py-2 px-3 border ${inputBorderColor} ${inputBgColor} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                defaultValue={currentUser.username}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <div>
              <input
                id="email"
                onChange={handleChange}
                type="text"
                className={`mt-1 block w-full py-2 px-3 border ${inputBorderColor} ${inputBgColor} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                defaultValue={currentUser.email}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Bio
            </label>
            <div>
              <textarea
                id="bio"
                onChange={handleChange}
                className={`mt-1 block w-full py-2 px-3 border ${inputBorderColor} ${inputBgColor} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                defaultValue={currentUser.bio}
              />
            </div>
          </div>

          <div className="flex gap-4 items-center justify-end">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={loading || imageFileUploading}
            >
              {loading ? "Loading..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateProfile;
