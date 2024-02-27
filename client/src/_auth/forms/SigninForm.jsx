import { Activity } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  signInFailure,
  signInStart,
  signInSuccess,
} from "../../redux/user/userSlice";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const SigninForm = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { error: errorMessage, loading } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error("Please fill all the fields");
      return dispatch(signInFailure("Please fill all the fields"));
    }

    try {
      dispatch(signInStart());
      const toastId = toast.loading("Signing in");
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success === false) {
        toast.error(data.message, {
          id: toastId,
        });

        dispatch(signInFailure(data.message));
      }
      if (res.ok) {
        toast.success("Logged in successfully", {
          id: toastId,
        });
        dispatch(signInSuccess(data));
        navigate("/");
      }
    } catch (error) {
      toast.error(error.message);
      dispatch(signInFailure(error.message));
    } finally {
      dispatch(signInFailure(null));
    }
  };

  return (
    <div className="mx-auto pt-10 flex w-full max-w-sm flex-col gap-6">
      <div className="flex flex-col items-center">
        <Activity className="mx-auto h-8 w-auto text-indigo-600" />
        <p className=" text-center text-2xl font-bold leading-9 tracking-tight text-indigo-600">
          Vibe
        </p>
        <h1 className="pt-8 text-3xl font-semibold">Sign In</h1>
        <p className="pt-2 text-md">Welcome Back</p>
      </div>
      <form className="p-2 pr-4 pl-4" onSubmit={handleSubmit}>
        <div className="form-group">
          <div className="form-field">
            <label className="form-label">Email address</label>
            <input
              onChange={handleChange}
              id="email"
              placeholder="Email"
              type="email"
              className="input max-w-full"
              value={formData.email}
            />
          </div>
          <div className="form-field">
            <label className="form-label">Password</label>
            <div className="form-control">
              <input
                onChange={handleChange}
                id="password"
                placeholder="******"
                type="password"
                className="input max-w-full"
                value={formData.password}
              />
            </div>
          </div>
          <div className="form-field"></div>
          <div className="form-field pt-5">
            <div className="form-control justify-between">
              <button type="submit" className="btn btn-primary w-full">
                Sign in
              </button>
            </div>
          </div>

          <div className="form-field">
            <div className="form-control justify-center">
              Don't have an account?
              <Link to="/sign-up" className=" link-primary text-sm">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SigninForm;
