import User from "../Models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from 'google-auth-library';

export const Register = async (req, res) => {
    const { name, email, password, phone } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword, phone});
        await newUser.save();
        res.status(201).json({ message: "User created successfully", user: newUser });
    } catch (error) {
        res.status(500).json({ message: "Error creating user", error });
    }
};

export const Login = async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const loginToken = jwt.sign({ UserId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.status(200).json({ message: "Login successful", user, token: loginToken });
    } catch (error) {
        res.status(500).json({ message: "Error logging in", error });
    }
};
export const Profile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        res.status(200).json({ message: "Profile fetched successfully", user });
    } catch (error) {
        res.status(500).json({ message: "Error fetching profile", error });
    }
};
export const UpdateProfile = async (req, res) => {
    const { name,phone } = req.body;
    try {
         let user = await User.findById(req.user._id);
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        user.name = name;
        user.phone = phone;
        await user.save();
        const safeUser = await User.findById(req.user._id).select('-password');
        res.status(200).json({ message: "Profile updated successfully", user: safeUser });
    } catch (error) {
        res.status(500).json({ message: "Error updating profile", error });
    }
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const GoogleLogin = async (req, res) => {
  const { credential } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload.email;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not registered" });
    }

    const loginToken = jwt.sign(
      { UserId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 🔥 Set secure cookie
    res.cookie("token", loginToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      path: "/",
    });

    return res.status(200).json({
      message: "Login successful",
      user,
      token: loginToken,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Google login failed",
      error: error.message,
    });
  }
};
