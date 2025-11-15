import { config } from 'dotenv';
import express from "express";
import mongoose from 'mongoose';
import cartRouter from "./Routes/Cart.js";
import userRoutes from "./Routes/user.js";
import productRouter from "./Routes/product.js";
import addressRouter from "./Routes/address.js";
import orderRouter from "./Routes/order.js";
import cors from 'cors';
import cookieParser from 'cookie-parser';

config({ path: ".env" });

const app = express();

// =====================================
// CORS FIXED + NEW NETLIFY DOMAIN ADDED
// =====================================

const allowedOrigins = [
  "http://localhost:3000",
  "https://magenta-swan-18e314.netlify.app",       // YOUR CORRECT FRONTEND
  "https://e-commerce-apis-fzt6.onrender.com"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (!allowedOrigins.includes(origin))
        return callback(new Error("Origin blocked by CORS"), false);
      callback(null, true);
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposedHeaders: ["set-cookie"]
  })
);

// Important for browser preflight
// app.options(
//   "*",
//   cors({
//     origin: allowedOrigins,
//     credentials: true
//   })
// );

// Parse cookies
app.use(cookieParser());

// Parse JSON body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ROUTES
app.use("/api/users", userRoutes);
app.use("/api/products", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/address", addressRouter);
app.use("/api/order", orderRouter);

// ==========================
// DATABASE CONNECTION
// ==========================
mongoose
  .connect(process.env.MONGODB_URI, {
    dbName: "Mongodb_connection_for_E_Commerce_API",
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ==========================
// START SERVER
// ==========================
const port = process.env.PORT || 2000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on port ${port}`);
});
