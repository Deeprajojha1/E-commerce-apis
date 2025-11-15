// middleware/auth.js
import jwt from "jsonwebtoken";
import User from "../Models/User.js";

export const isAuthenticated = async (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res.status(401).json({ message: "Login first" });
  }

  // Support both 'Bearer <token>' and raw token
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : authHeader.trim();

  if (!token) {
    return res.status(401).json({ message: "Login first" });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ message: "Server misconfigured: JWT secret missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.UserId);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized User" });
    }

    req.user = user; // Attach the user object
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
