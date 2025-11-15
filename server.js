import {config} from 'dotenv';
import express from "express";
import mongoose from 'mongoose';
import cartRouter from "./Routes/Cart.js";
import userRoutes from "./Routes/user.js";
import productRouter from "./Routes/product.js";
import addressRouter from "./Routes/address.js";
import orderRouter from "./Routes/order.js";
import cors from 'cors';

// .env setup
config({path:".env"});

const app = express();

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Auth', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
};

// Middleware to parse request body
app.use(express.urlencoded({ extended: true }));
// Use json 
app.use(express.json());
// CORS: relaxed for development (allow React dev server and custom headers)
app.use(cors(corsOptions));
// User Routes
app.use('/api/users', userRoutes);
// Product Routes
app.use('/api/products', productRouter);
// Cart Router
app.use('/api/cart', cartRouter);
// Address Router
app.use('/api/address', addressRouter);
// Order Router
app.use('/api/order', orderRouter);
// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, { dbName: "Mongodb_connection_for_E_Commerce_API" })
    .then(() => {
        console.log('MongoDB connected');
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
    });




// Start the server
const port = process.env.PORT || 2000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});