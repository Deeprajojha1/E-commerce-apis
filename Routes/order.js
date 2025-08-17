import express from 'express';
import { createOrder,getUserOrders,deleteOrder } from '../controllers/orderController.js';
import { isAuthenticated } from '../Middlewares/Auth.js';

const router = express.Router();

// Create a new order
router.post("/create-order", isAuthenticated, createOrder);
// Get all orders of a user
router.get("/:id", isAuthenticated, getUserOrders);
// delete order
router.delete("/:id", isAuthenticated, deleteOrder);
export default router;