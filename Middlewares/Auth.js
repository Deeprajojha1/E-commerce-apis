// middleware/auth.js
import jwt from "jsonwebtoken";
import User from "../Models/User.js";

export const isAuthenticated = async (req, res, next) => {
  const token = req.header("Auth"); // or "Authorization" depending on your client
  if (!token) {
    return res.status(401).json({ message: "Login first" });
  }
//   console.log("Token received:", token);
//   console.log(jwt.verify(token, process.env.JWT_SECRET));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.UserId);
    // console.log("Decoded token:", decoded.UserId);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized User" });
    }

    req.user = user; // Attach the user object
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
