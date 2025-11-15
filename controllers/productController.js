import Product from "../Models/Product.js";
// Add product
export const createProduct = async (req, res) => {
    const newProduct = new Product(req.body);
    console.log(newProduct);
    try {
        const savedProduct = await newProduct.save();
        res.status(201).json({ message: "Product created successfully", product: savedProduct });
    } catch (error) {
        res.status(500).json({ message: "Error creating product", error });
    }
};
// Get all product
 // Make sure your Product model is imported
// get product by id
const SEARCH_FIELDS = [
  "product_name",
  "name",
  "title",
  "description",
  "brand",
  "category",
  "subcategory",
  "sub_category",
  "color",
  "colors_available",
  "material",
  "materials",
  "tags",
  "keywords",
];

const UNWIND_STAGES = [
  { $unwind: { path: "$products", preserveNullAndEmptyArrays: false } },
  { $replaceRoot: { newRoot: "$products" } },
];

const buildMatch = (terms, requireAll) => {
  if (!terms.length) return {};
  if (requireAll) {
    return {
      $and: terms.map((t) => ({
        $or: SEARCH_FIELDS.map((f) => ({ [f]: new RegExp(t, "i") })),
      })),
    };
  }
  return {
    $or: terms.flatMap((t) => SEARCH_FIELDS.map((f) => ({ [f]: new RegExp(t, "i") }))),
  };
};

// In productController.js, update the getProducts function:

export const getProducts = async (req, res) => {
  try {
    const searchParam = (req.query.search ?? req.query.q ?? "").toString();
    const terms = searchParam.trim() ? searchParam.trim().split(/\s+/) : [];
    
    // Parse categories
    const categoryRaw = (req.query.category ?? "").toString().trim();
    const categories = categoryRaw
      ? categoryRaw.split(",").map(s => s.trim()).filter(Boolean)
      : [];
    
    // Build the base query
    let query = {};
    
    // Add search terms if they exist
    if (terms.length > 0) {
      query.$or = SEARCH_FIELDS.flatMap(field => 
        terms.map(term => ({ [field]: new RegExp(term, 'i') }))
      );
    }
    
    // Add category filter
    if (categories.length > 0) {
      query.category = { $in: categories.map(c => new RegExp(`^${c}$`, 'i')) };
    }
    
    // Add rating filter
    if (req.query.rating) {
      const rating = parseFloat(req.query.rating);
      if (!isNaN(rating)) {
        query.rating = { $gte: rating };
      }
    }
    
    // Add price filter
    if (req.query.price) {
      const price = req.query.price.toString();
      if (price.includes('-')) {
        const [min, max] = price.split('-').map(Number);
        if (!isNaN(min) && !isNaN(max)) {
          query.$or = [
            { price: { $gte: min, $lte: max } },
            { mrp: { $gte: min, $lte: max } },
            { discount_price: { $gte: min, $lte: max } },
            { discountPrice: { $gte: min, $lte: max } }
          ];
        }
      } else {
        const priceNum = parseFloat(price);
        if (!isNaN(priceNum)) {
          query.$or = [
            { price: priceNum },
            { mrp: priceNum },
            { discount_price: priceNum },
            { discountPrice: priceNum }
          ];
        }
      }
    }
    
    // Set timeout for the query
    const options = {
      maxTimeMS: 30000, // 30 seconds timeout
      allowDiskUse: true // Allow disk use for large aggregations
    };
    
    // Execute the query
    let products;
    if (UNWIND_STAGES.length > 0) {
      products = await Product.aggregate([
        ...UNWIND_STAGES,
        { $match: query }
      ], options);
    } else {
      products = await Product.find(query, null, options);
    }
    
    res.status(200).json(products);
    
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ 
      message: "Error fetching products", 
      error: error.message,
      code: error.code
    });
  }
};

// get product by id
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find a document containing a product with this id
    const result = await Product.findOne(
      { "products.product_id": id },
      { "products.$": 1 } // return only the matching product
    );

    if (!result || !result.products || result.products.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Extract the single matched product
    const product = result.products[0];
    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Error fetching product", error });
  }
};

// Update product
export const updateProduct = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    try {
        const updatedProduct = await Product.findByIdAndUpdate(id, updates, { new: true });
        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json({ message: "Product updated successfully", product: updatedProduct });
    } catch (error) {
        res.status(500).json({ message: "Error updating product", error });
    }
};
// Delete by id
export const deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedProduct = await Product.findByIdAndDelete(id);
        if (!deletedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json({ message: "Product deleted successfully", product: deletedProduct });
    } catch (error) {
        res.status(500).json({ message: "Error deleting product", error });
    }
};
