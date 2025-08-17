import express from 'express';
import { Register,Login } from '../controllers/userController.js';

const router = express.Router();
// register
// /api/users/register
router.post('/register', Register);
// login
// /api/users/login
router.post('/login', Login);

export default router;