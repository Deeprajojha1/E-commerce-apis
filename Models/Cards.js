import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
    productId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Product",
    required:true
   },

  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  quantities: {
    type: Number,
    required: true,
    default: 1
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
},{strict:false},{ timestamps: true });

const CartItem = new mongoose.Schema({
    userId: {
      type:mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    items: [cartItemSchema]
},{ timestamps: true });

const Cart = mongoose.model("Cart", CartItem);
export default Cart;
