import express from "express";
import {
  addAddress,
  getUserAddresses,
  updateAddress,
  deleteAddress
} from "../controllers/addressController.js";
import { isAuthenticated } from '../Middlewares/Auth.js';

const router = express.Router();

router.post("/add", isAuthenticated, addAddress);
router.get("/user", isAuthenticated, getUserAddresses);
router.put("/:id", isAuthenticated, updateAddress);
router.delete("/:id", isAuthenticated, deleteAddress);

export default router;
