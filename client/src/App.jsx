import { Routes, Route } from "react-router-dom";
import "./globals.css";
import SigninForm from "./_auth/forms/SigninForm";
import SignupForm from "./_auth/forms/SignupForm";
import { Home } from "./_root/pages";
import RootLayout from "./_root/RootLayout";
import Google from "./_auth/forms/Google";

import {
  Saved,
  AllUsers,
  CreatePost,
  EditPost,
  PostDetails,
  Profile,
  UpdateProfile,
} from "./_root/pages";
import PrivateRoute from "./components/shared/PrivateRoute";
import SocialLinks from "./components/shared/SocialLinks";
import Followers from "./components/shared/Followers";
import Following from "./components/shared/Following";
import SearchUser from "./_root/pages/Search";
import AuthWrapper from "./components/AuthWrapper";

const App = () => {
  return (
    <main className="flex h-screen ">
      <Routes>
        {/* Public routes */}
        <Route path="/continue-signin" element={<Google />} />
        <Route path="/sign-in" element={<SigninForm />} />
        <Route path="/sign-up" element={<SignupForm />} />

        {/* private routes */}

        <Route element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path="/posts/:id" element={<PostDetails />} />
          <Route element={<AuthWrapper />}>
            <Route path="/search" element={<SearchUser />} />
            <Route path="/saved" element={<Saved />} />
            <Route path="/all-users" element={<AllUsers />} />
            <Route element={<PrivateRoute />}>
              <Route path="/create-post" element={<CreatePost />} />
            </Route>
            <Route path="/update-post/:id" element={<EditPost />} />
            <Route path="/followers/:id" element={<Followers />} />
            <Route path="/following/:id" element={<Following />} />
            <Route path="/profile/:id/*" element={<Profile />} />
            <Route path="/profile/:id/social-links" element={<SocialLinks />} />
            <Route path="/update-profile/:id" element={<UpdateProfile />} />
          </Route>
        </Route>
      </Routes>
    </main>
  );
};

export default App;
