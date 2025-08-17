import Address from "../Models/Address.js";

// Add new address
export const addAddress = async (req, res) => {
  try {
    const newAddress = new Address({ ...req.body, userId: req.user._id });
    const savedAddress = await newAddress.save();
    res.status(201).json(savedAddress);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all addresses of logged-in user
export const getUserAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ userId: req.user._id });
   res.status(200).json(addresses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// Update Address
export const updateAddress = async (req, res) => {
  const { fullName, phone, addressLine1, addressLine2, city, state, postalCode, country } = req.body;
  const { id } = req.params; // address id from URL

  try {
    // Find address by id + make sure it belongs to the logged-in user
    const address = await Address.findOne({ _id: id, userId: req.user._id });

    if (!address) {
      return res.status(404).json({ message: "Address not found for this user" });
    }

    // Update only the provided fields
    if (fullName) address.fullName = fullName;
    if (phone) address.phone = phone;
    if (addressLine1) address.addressLine1 = addressLine1;
    if (addressLine2) address.addressLine2 = addressLine2;
    if (city) address.city = city;
    if (state) address.state = state;
    if (postalCode) address.postalCode = postalCode;
    if (country) address.country = country;

    // Save updated address
    const updatedAddress = await address.save();

    res.status(200).json({
      message: "Address updated successfully",
      address: updatedAddress,
    });
  } catch (err) {
    console.error("Update Address Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// Delete address
export const deleteAddress = async (req, res) => {
  try {
    const deleted = await Address.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!deleted) return res.status(404).json({ message: "Address not found" });
    res.json({ message: "Address deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};