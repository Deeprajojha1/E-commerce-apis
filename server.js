import { config } from 'dotenv';
import express from "express";
import mongoose from 'mongoose';
import cartRouter from "./Routes/Cart.js";
import userRoutes from "./Routes/user.js";
import productRouter from "./Routes/product.js";
import addressRouter from "./Routes/address.js";
import orderRouter from "./Routes/order.js";
import cors from 'cors';
import cookieParser from 'cookie-parser';  // Keep only one import

// .env setup
config({ path: ".env" });

const app = express();

// CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  'https://dashing-kitsune-4460c0.netlify.app',
  'https://e-commerce-apis-fzt6.onrender.com'
];

// Apply CORS with specific settings
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'x-requested-with'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  exposedHeaders: ['set-cookie']
}));

// Cookie parser middleware
app.use(cookieParser());

// // Handle preflight requests
// app.options('*', cors({
//   origin: allowedOrigins,
//   credentials: true
// }));

// Middleware to parse request body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Your routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/address', addressRouter);
app.use('/api/order', orderRouter);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, { 
  dbName: "Mongodb_connection_for_E_Commerce_API",
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('MongoDB connected');
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
});

// Start the server
const port = process.env.PORT || 2000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});