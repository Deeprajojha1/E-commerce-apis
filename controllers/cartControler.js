import  Cart  from "../Models/Cards.js";

// add to cart
export const addToCart = async (req, res) => {
    const { productId, name, description, price, imageUrl, quantities, rating } = req.body;

    try {
        let cart = await Cart.findOne({ userId: req.user._id }); // <-- use let
// If cart has not been created for the user
        if (!cart) {
            cart = new Cart({ userId: req.user._id, items: [] });
        }
        // Check if item already exists in cart
        const itemIndex = cart.items.findIndex((item) => item.productId.toString() == productId);
        // If item exists, update its quantity and price
        // Else add new item
        if (itemIndex > -1) {
            cart.items[itemIndex].quantities += quantities;
            cart.items[itemIndex].price = price * cart.items[itemIndex].quantities;
            await cart.save();
        } else {
            cart.items.push({ productId, name, description, price, imageUrl, quantities, rating });
            await cart.save();
        }

        res.status(200).json({ message: "Item added to cart successfully" });
    } catch (error) {
        console.error("Error adding item to cart:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Ager one user id se multiple items add krna hai to 
// To iss form me add hoga
// [
//     {
//         productId: "123",
//         name: "Product 1",
//         description: "Description 1",
//         price: 100,
//         imageUrl: "http://example.com/image1.jpg",
//         quantities: 2,
//         rating: 4.5
//     },
//     {
//         productId: "456",
//         name: "Product 2",
//         description: "Description 2",
//         price: 200,
//         imageUrl: "http://example.com/image2.jpg",
//         quantities: 1,
//         rating: 4.0
//     }
// ]

// get user cart
export const getUserCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user._id });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }
        res.status(200).json(cart);
    } catch (error) {
        console.error("Error fetching user cart:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
// Remove product form cart
export const removeFromCart = async (req, res) => {
    const { productId } = req.params;

    try {
        const cart = await Cart.findOne({ userId: req.user._id });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        // Find the item in the cart
        const itemIndex = cart.items.findIndex((item) => item.productId.toString() === productId);
        if (itemIndex === -1) {
            return res.status(404).json({ message: "Item not found in cart" });
        }

        // Remove the item from the cart
        // cart.items.splice(itemIndex, 1);
        cart.items = cart.items.filter((item) => item.productId.toString() !== productId);
        await cart.save();

        res.status(200).json({ message: "Item removed from cart successfully" });
    } catch (error) {
        console.error("Error removing item from cart:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
// Clear cart
export const clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user._id });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        // Clear the cart
        cart.items = [];
        await cart.save();

        res.status(200).json({ message: "Cart cleared successfully" });
    } catch (error) {
        console.error("Error clearing cart:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
// decrease quantity
export const decreaseQuantity = async (req, res) => {
    const { productId, quantities } = req.body;

    try {
        let cart = await Cart.findOne({ userId: req.user._id }); // <-- use let
// If cart has not been created for the user
        if (!cart) {
            cart = new Cart({ userId: req.user._id, items: [] });
        }
        // Check if item already exists in cart
        const itemIndex = cart.items.findIndex((item) => item.productId.toString() == productId);
        // If item exists, update its quantity and price
        // Else add new item
        if (itemIndex > -1) {
            const item=cart.items[itemIndex];
            if(item.quantities>quantities){
                const priceperunit=item.price/item.quantities;
                item.quantities-=quantities;
                item.price-=priceperunit*quantities;
            }else{
                cart.items.splice(itemIndex, 1);
            }
           
        } else {
            return res.status(404).json({ message: "Item not found in cart" });
        }
        await cart.save();
        res.status(200).json({ message: "Item decreased in cart successfully" });
    } catch (error) {
        console.error("Error adding item to cart:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};