import { useEffect, useState } from "react";
import { Activity } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { PiGithubLogoLight } from "react-icons/pi";
import { Link } from "react-router-dom";
import {
  GithubAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
  getAuth,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";
import { app } from "../../firebase";
import { useDispatch } from "react-redux";
import { signInSuccess } from "../../redux/user/userSlice";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Google = () => {
  const auth = getAuth(app);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Handle the redirect result if the user is redirected back to the application after GitHub authentication
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          // User is authenticated, handle the user data as needed
          const { displayName, email, photoURL } = result.user;
          const res = await fetch("/api/auth/github", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              displayname: displayName,
              email: email,
              avatar: photoURL,
            }),
          });

          const data = await res.json();
          if (res.ok) {
            dispatch(signInSuccess(data));
            navigate("/");
            toast.success("Sign In Successful", { id: toastId1 });
          }
        }
      } catch (error) {
        console.log(error);
      }
    };

    // Call the function to handle the redirect result
    handleRedirectResult();
  }, []);

  let toastId;

  const handleGoogleClick = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    try {
      // Show loading toast while signing in
      const toastId = toast.loading("Signing in with Google...");

      // Sign in with Google using popup
      const resultsFromGoogle = await signInWithPopup(auth, provider);

      // Close the loading toast once sign-in is successful
      toast.dismiss(toastId);

      // Proceed with authentication process
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: resultsFromGoogle.user.email,
          avatar: resultsFromGoogle.user.photoURL,
          fullname: resultsFromGoogle.user.displayName,
        }),
      });

      const img = new Image();
      img.src = resultsFromGoogle.user.photoURL;
      img.referrerPolicy = "no-referrer"; // Add this line

      const data = await res.json();
      if (res.ok) {
        dispatch(signInSuccess(data));
        navigate("/");
        toast.success("Sign In Successful", { id: toastId });
      }
    } catch (error) {
      // Close the loading toast if sign-in fails
      toast.dismiss(toastId);

      // Check if the error is due to the Google login modal being closed
      if (error.code === "auth/popup-closed-by-user") {
        toast.error("Sign in with Google cancelled by user", { id: toastId });
      } else {
        // Show other error messages
        console.log(error);
        toast.error(error.message, { id: toastId });
      }
    }
  };

  const handleGithubClick = async () => {
    const provider = new GithubAuthProvider(); // Create GitHub auth provider instance
    try {
      setLoading(true);
      // Redirect the user to the GitHub authentication page
      await signInWithRedirect(auth, provider);
    } catch (error) {
      console.log(error);
    }
  };

  let toastId1;

  if (loading) {
    toastId1 = toast.loading("Signing in with GitHub...");
  }

  return (
    <div className="mx-auto  flex w-full max-w-sm flex-col gap-6 pt-32 ">
      <div className="mx-auto drop-shadow-sm shadow-sm  p-12 -mt-5 rounded-lg text-center">
        <Activity className="mx-auto h-8 w-auto text-indigo-600" />
        <p className="mt-2 text-2xl font-bold leading-9 tracking-tight text-indigo-600">
          Vibe
        </p>
        <p className="mt-1 text-sm font-semibold tracking-tight">
          Find Your Vibe
        </p>
        <Link to="/sign-in" className=" btn btn-wide btn-primary mt-7">
          {/* <LogIn className="inline-block w-6 h-6 mr-2" /> Login here */}
          Login here
        </Link>
        <p className="mt-5 text-sm font-semibold tracking-tight">
          OR continue with
        </p>
        <div className="mt-5">
          <button
            className="btn btn-wide btn-neutral hover:text-white"
            onClick={handleGoogleClick}
          >
            <FcGoogle className="inline-block w-6 h-6 mr-2" /> Continue With
            Google
          </button>
        </div>
        <div className="mt-3">
          <button
            className="btn btn-wide btn-neutral hover:text-white"
            onClick={handleGithubClick}
          >
            <PiGithubLogoLight className="inline-block w-6 h-6 mr-2 " />{" "}
            Continue With GitHub
          </button>
        </div>
      </div>
    </div>
  );
};

export default Google;
