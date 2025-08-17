import  Cart  from "../Models/Cards.js";
import Order from "../Models/Order.js";
import Address from "../Models/Address.js";
// Create a new order
export const createOrder = async (req, res) => {
  try {
    const { productId, addressId } = req.body; // client will send productId & addressId
    const userId = req.user._id;

    // Check shipping address
    const address = await Address.findOne({ _id: addressId, userId });
    if (!address) {
      return res.status(404).json({ message: "Shipping address not found" });
    }

    // Find user cart & product inside it
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const product = cart.items.find(item => item.productId.toString() === productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    // 3 Create new order
   const newOrder = new Order({
  userId,
  products: [product], // <-- fix here
  shippingAddress: address._id,
  totalAmount: product.price * product.quantities,
});

    await newOrder.save();

    // 4️ Remove that product from cart after ordering
    cart.items = cart.items.filter(item => item.productId.toString() !== productId);
    await cart.save();

    res.status(201).json({ message: "Order placed successfully", order: newOrder });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Get all orders of a user
export const getUserOrders = async (req, res) => {
  const { id } = req.params; // use 'id' to match your route
  try {
    const userId = req.user._id;
    const order = await Order.findOne({ _id: id, userId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Delete order
export const deleteOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const userId = req.user._id;
    const order = await Order.findOneAndDelete({ _id: id, userId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
