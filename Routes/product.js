import express from 'express';
import { createProduct,getProducts,getProductById,updateProduct,deleteProduct } from '../controllers/productController.js';
const router = express.Router();

// Add product
// /api/products/add
router.post('/add', createProduct);
// Get All product
// /api/products/
router.get('/all', getProducts);

// Get Product By id
// /api/product/:id
router.get('/:id', getProductById);

// Update product by id
// /api/product/:id
router.put('/:id', updateProduct);

// Delete Product By id
// /api/product/:id
router.delete('/:id', deleteProduct);
export default router;