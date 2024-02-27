import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { errorHandler } from "../utils/error.js";

export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;

  // Check if all fields are provided and not empty
  if (
    !username ||
    !email ||
    !password ||
    username === "" ||
    email === "" ||
    password === ""
  ) {
    return next(errorHandler(400, "Please fill in all fields."));
  }

  // Check if password meets the minimum length requirement
  if (password.length < 6) {
    return next(
      errorHandler(400, "Password must be at least 6 characters long.")
    );
  }

  try {
    // Check if user with provided email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(
        errorHandler(
          400,
          "Email already exists. Please use a different email address."
        )
      );
    }

    // Hash the password
    const hashedPassword = await bcryptjs.hash(password, 12);

    // Create new user
    const newUser = new User({
      fullname: username,
      username,
      email,
      password: hashedPassword,
    });

    // Save the user to the database
    await newUser.save();

    // Generate JWT token
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);

    // Exclude password from user object
    const { password: pass, ...rest } = newUser._doc;

    // Send response with token and user data
    res
      .status(201)
      .cookie("access_token", token, {
        maxAge: 15 * 24 * 60 * 60 * 1000,
        Expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      })
      .json(rest);
  } catch (error) {
    if (error.code === 11000) {
      if (error.keyPattern.username) {
        return next(
          errorHandler(
            400,
            "Username already exists. Please choose a different one."
          )
        );
      } else if (error.keyPattern.email) {
        return next(
          errorHandler(
            400,
            "Email already exists. Please use a different email address."
          )
        );
      }
    } else if (error.message.includes("buffering timed out after 10000ms")) {
      return next(
        errorHandler(
          500,
          "Server took too long to respond. Please try again later."
        )
      );
    } else {
      return next(
        errorHandler(500, "Something went wrong! Please try again later.")
      );
    }
    next(error);
  }
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password || email === "" || password === "") {
    return next(errorHandler("400", " all fields are requred"));
  }

  try {
    const validUser = await User.findOne({ email });

    if (!validUser) {
      return next(errorHandler(404, "User not found"));
    }

    const validPassword = bcryptjs.compareSync(password, validUser.password);

    if (!validPassword) {
      return next(errorHandler(400, "Invalid credentials"));
    }

    const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET);

    const { password: pass, ...rest } = validUser._doc;

    res
      .status(200)
      .cookie("access_token", token, {
        maxAge: 15 * 24 * 60 * 60 * 1000,
        Expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      })
      .json(rest);
  } catch (error) {
    next(error);
  }
};

export const google = async (req, res, next) => {
  const { fullname, email, avatar } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      const { password, ...rest } = user._doc;
      res
        .status(200)
        .cookie("access_token", token, {
          maxAge: 15 * 24 * 60 * 60 * 1000,
          Expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          httpOnly: true,
          sameSite: "strict",
          secure: process.env.NODE_ENV === "production",
        })
        .json(rest);
    } else {
      const generatedPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
      const newUser = new User({
        fullname: fullname,
        username:
          fullname.toLowerCase().split(" ").join("") +
          Math.random().toString(9).slice(-4),
        email,
        password: hashedPassword,
        avatar: avatar,
      });
      await newUser.save();
      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
      const { password, ...rest } = newUser._doc;
      res
        .status(200)
        .cookie("access_token", token, {
          maxAge: 15 * 24 * 60 * 60 * 1000,
          Expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          httpOnly: true,
          sameSite: "strict",
          secure: process.env.NODE_ENV === "production",
        })
        .json(rest);
    }
  } catch (error) {
    next(error);
  }
};

export const github = async (req, res, next) => {
  const { email, avatar, displayname } = req.body; // Extracting user data from the request body
  try {
    // Check if the user already exists in the database based on their email
    const user = await User.findOne({ email });

    // If 'name' is not provided by GitHub, generate a username based on email
    const username = email.split("@")[0]; // Use the part of the email before '@'
    // You can further process 'username' to make it unique or fit any validation rules
    // For example, you can add a random string to ensure uniqueness
    const generatedUsername = username + Math.random().toString(9).slice(-4);

    if (user) {
      // If the user already exists, generate a JWT token for them
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

      // Exclude sensitive information like password from the response
      const { password, ...rest } = user._doc;

      // Send the token as a cookie and the user data in the response
      res
        .status(200)
        .cookie("access_token", token, {
          maxAge: 15 * 24 * 60 * 60 * 1000,
          Expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          httpOnly: true,
          sameSite: "strict",
          secure: process.env.NODE_ENV === "production",
        })
        .json(rest);
    } else {
      // If the user does not exist, create a new user based on GitHub data

      // Generate a random password for the new user
      const generatedPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);

      // Create a new user object with GitHub data
      const newUser = new User({
        avatar: avatar,
        username: generatedUsername,
        fullname: displayname || email.split("@")[0],
        email,
        password: hashedPassword, // Store the hashed password
      });

      // Save the new user to the database
      await newUser.save();

      // Generate a JWT token for the new user
      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);

      // Exclude sensitive information like password from the response
      const { password, ...rest } = newUser._doc;

      // Send the token as a cookie and the user data in the response
      res
        .status(200)
        .cookie("access_token", token, {
          maxAge: 15 * 24 * 60 * 60 * 1000,
          Expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          httpOnly: true,
          sameSite: "strict",
          secure: process.env.NODE_ENV === "production",
        })
        .json(rest);
    }
  } catch (error) {
    // Handle errors
    next(error);
  }
};
