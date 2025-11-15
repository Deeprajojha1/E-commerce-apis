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

export const getProducts = async (req, res) => {
  try {
    const searchParam = (req.query.search ?? req.query.q ?? "").toString();
    const terms = searchParam.trim() ? searchParam.trim().split(/\s+/) : [];

    // Parse categories from query: ?category=Electronics or ?category=Electronics,Furniture
    const categoryRaw = (req.query.category ?? "").toString().trim();
    const categories = categoryRaw
      ? categoryRaw
          .split(",")
          .map((s) => s.trim())
          .filter((c) => c && c.toLowerCase() !== "all")
      : [];
    
    // Parse rating filter: ?rating=4 (exact) or ?rating=4+ (4 and above)
    const ratingFilter = req.query.rating ? req.query.rating.toString() : '';
    
    // Parse price filter: ?price=1000 (exact) or ?price=1000-2000 (range)
    const priceFilter = req.query.price ? req.query.price.toString() : '';
    
    const catRegexes = categories.map((c) => new RegExp(`^${c}$`, "i"));
    
    // Build the base match conditions
    const matchConditions = [];
    
    // Add category filter if categories exist
    if (categories.length) {
      matchConditions.push({ category: { $in: catRegexes } });
    }
    
    // Add rating filter if rating exists
    if (ratingFilter) {
      if (ratingFilter.endsWith('+')) {
        // For ratings of X and above (e.g., 4+)
        const minRating = parseFloat(ratingFilter);
        if (!isNaN(minRating)) {
          matchConditions.push({ rating: { $gte: minRating } });
        }
      } else {
        // For exact rating match
        const exactRating = parseFloat(ratingFilter);
        if (!isNaN(exactRating)) {
          matchConditions.push({ rating: exactRating });
        }
      }
    }
    
    // Add price filter if price exists
    if (priceFilter) {
      if (priceFilter.includes('-')) {
        // For price range (e.g., 1000-2000)
        const [min, max] = priceFilter.split('-').map(Number);
        if (!isNaN(min) && !isNaN(max)) {
          matchConditions.push({
            $or: [
              { price: { $gte: min, $lte: max } },
              { mrp: { $gte: min, $lte: max } },
              { discount_price: { $gte: min, $lte: max } },
              { discountPrice: { $gte: min, $lte: max } }
            ]
          });
        }
      } else {
        // For exact price or minimum price
        const price = parseFloat(priceFilter);
        if (!isNaN(price)) {
          matchConditions.push({
            $or: [
              { price: price },
              { mrp: price },
              { discount_price: price },
              { discountPrice: price }
            ]
          });
        }
      }
    }
    
    // Combine all match conditions with $and
    const matchStage = matchConditions.length > 0 ? { $match: { $and: matchConditions } } : {};

    if (terms.length) {
      // First try with all terms required
      let products = await Product.aggregate([
        ...UNWIND_STAGES,
        { $match: buildMatch(terms, true) },
        ...(matchConditions.length ? [matchStage] : [])
      ]);

      // If no results, try with any term matching
      if (!products.length) {
        products = await Product.aggregate([
          ...UNWIND_STAGES,
          { $match: buildMatch(terms, false) },
          ...(matchConditions.length ? [matchStage] : [])
        ]);
      }

      return res.status(200).json(products);
    }

    // If no search terms, just apply filters
    const all = await Product.aggregate([
      ...UNWIND_STAGES,
      ...(matchConditions.length ? [matchStage] : [])
    ]);
    
    return res.status(200).json(all);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Error fetching products", error });
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
