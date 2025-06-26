import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    // check if all fields are provided
    if (!fullName) {
      return res.status(400).json({
        message: "Full name is required",
      });
    }
    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }
    if (!password) {
      return res.status(400).json({
        message: "Password is required",
      });
    }
    // check password length
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }
    // check if user already exists
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        message: "User already exists",
      });
    }
    // hash password
    const slat = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, slat);

    // create new user
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    // save user to database
    if (newUser) {
      // Generate JWT token
      generateToken(newUser._id, res);
      await newUser.save();
      return res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    } else {
      return res.status(400).json({
        message: "Invalid user data",
      });
    }
  } catch (error) {
    console.error("Error during signup:", error.message);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({
      message: "Email is required",
    });
  }

  if (!password) {
    return res.status(400).json({
      message: "Password is required",
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }
    // Check if password matches
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    // Generate JWT token
    generateToken(user._id, res);

    return res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.error("Error during login:", error.message);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const logout = (req, res) => {
  // Handle logout logic here
  try {
    res.clearCookie("jwt");
    return res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Error during logout:", error.message);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic} = req.body;
    const userId = req.user._id;

    if(!profilePic) {
      return res.status(400).json({
        message: "Profile picture is required",
      });
    }

    const uploadRespose = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadRespose.secure_url },
      { new: true }
    ).select("-password");

    res.status(200).json(updatedUser);
  }
  catch (error) {
    console.error("Error updating profile:", error.message);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.error("Error checking authentication:", error.message);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
