import express from 'express';
import { addToCart,getUserCart,removeFromCart,clearCart,decreaseQuantity } from '../controllers/cartControler.js';
import { isAuthenticated } from '../Middlewares/Auth.js';
const router = express.Router();
// add to cart
router.post('/add', isAuthenticated, addToCart);
// get user cart
router.get('/user', isAuthenticated, getUserCart);
// remove product from cart
router.delete('/remove/:productId', isAuthenticated, removeFromCart);
// clear cart
router.delete('/clear', isAuthenticated, clearCart);
// decrease quantity
router.post('/decrease', isAuthenticated, decreaseQuantity);
export default router;