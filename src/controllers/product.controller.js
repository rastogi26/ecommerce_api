import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Product } from "../models/product.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { isValidObjectId } from "mongoose";
import { Category } from "../models/category.model.js";

const registerProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    richDescription,
    brand,
    price,
    category,
    countInStock,
    isFeatured,
  } = req.body;

  // Check if required fields are provided
  if (!name || !description || !price || !category || !countInStock || !brand) {
    throw new ApiError(
      400,
      "Name, description, price, category, brand, and countInStock are required fields"
    );
  }

  // Check if a product with the same name already exists
  const existingProduct = await Product.findOne({ name: name });

  if (existingProduct) {
    throw new ApiError(400, "A product with this name already exists");
  }

  // Convert countInStock and price to integers
  const countInStockInt = parseInt(countInStock);
  const priceInt = parseInt(price);

  // Ensure countInStock and price are positive integers
  if (
    !Number.isInteger(countInStockInt) ||
    countInStockInt <= 0 ||
    !Number.isFinite(priceInt) ||
    priceInt <= 0
  ) {
    throw new ApiError(400, "CountInStock and price must be positive integers");
  }

  // Find or create the category by name
  let foundCategory = await Category.findOne({ name: category });

  if (!foundCategory) {
    // If the category doesn't exist, create a new one
    foundCategory = await Category.create({ name: category });
  }

  const productImageLocalPath = req.file?.path; // extract the path from local files in public

  if (!productImageLocalPath) {
    throw new ApiError(400, "ProductImage file is required");
  }

  // Upload image to cloudinary
  const productImage = await uploadOnCloudinary(productImageLocalPath);

  if (!productImage) {
    throw new ApiError(400, "Product image upload failed");
  }

  const product = await Product.create({
    name: name.toLowerCase(),
    description,
    richDescription,
    brand,
    price: priceInt,
    countInStock: countInStockInt,
    category: foundCategory._id, // Assign the category ID
    isFeatured,
    image: productImage.url,
  });

  // Check if product was created successfully
  if (!product) {
    throw new ApiError(500, "Failed to register product");
  }

  return res.status(200).json({
    status: "success",
    message: "Product registered successfully",
    data: product,
  });
});


// // Product Listing - Fetch products based on the provided category ID
const getProductList = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;

  // Validate category ID
  if (!categoryId) {
    throw new ApiError(400, "Category ID is required");
  }

  // Find products by category ID
  const products = await Product.find({ category: categoryId })
    .select("name price description countInStock")
    .populate("category", "name"); // Populate the 'category' field with its name

  if (!products || products.length === 0) {
    throw new ApiError(404, "No products found for the provided category ID");
  }

  // Map products to desired format
  const productList = products.map((product) => ({
    title: product.name,
    price: product.price,
    description: product.description,
    countInStock: product.countInStock,
    category: product.category.name, // Access the populated category name
  }));

  // Return response
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        productList,
        "Product listing retrieved successfully"
      )
    );
});

// Product Details
const getProductDetails = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (!isValidObjectId(productId)) {
    throw new ApiError(400, "Invalid product ID");
  }

  // Fetch the product details based on the provided product ID
  const product = await Product.findById(productId);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, product, "Product details retrieved successfully")
    );
});

export { registerProduct, getProductList, getProductDetails };
