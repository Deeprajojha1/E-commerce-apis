import express from 'express';
import { Register,Login,Profile,UpdateProfile,GoogleLogin } from '../controllers/userController.js';
import { isAuthenticated } from '../Middlewares/Auth.js';
const router = express.Router();
// register
// /api/users/register
router.post('/register', Register);
// login
// /api/users/login
router.post('/login', Login);
router.post('/google-login', GoogleLogin); 
// profile
// /api/users/profile
router.get('/profile', isAuthenticated, Profile);
// update profile
// /api/users/updateProfile
router.put('/updateProfile', isAuthenticated, UpdateProfile);


export default router;