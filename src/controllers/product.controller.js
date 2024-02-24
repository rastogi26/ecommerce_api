import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Product } from "../models/product.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { isValidObjectId } from "mongoose";

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
      " Name, description, price, category, brand and countInStock are required fields"
    );
  }
  // Ensure countInStock and price are positive integers
  if (
    !Number.isInteger(countInStock) ||
    countInStock <= 0 ||
    !Number.isFinite(price) ||
    price <= 0
  ) {
    throw new ApiError(400, "CountInStock and price must be positive integers");
  }
  const productImageLocalPath = req.files?.productImage[0]?.path; // extract the path from local files in public

  if (!productImageLocalPath) {
    throw new ApiError(400, "ProductImage file is required");
  }

  //upload on cloudinary
  const productImage = await uploadOnCloudinary(productImageLocalPath);

  // check for image
  if (!productImage) {
    throw new ApiError(400, "Product image is required");
  }

  const product = await Product.create({
    name: name.toLowerCase(),
    description,
    richDescription,
    brand,
    price,
    countInStock,
    category,
    isFeatured,
    image: productImage.url, //cloudinary return a response and we can get url link from that response
  });

  // check if product created or not
  const createdProduct = await Product.findById(product._id);

  if (!createdProduct) {
    throw new ApiError(
      500,
      "Something went wrong while rigistering the product "
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(400, createdProduct, "Successfully registered product")
    );
});

// Product Listing
const getProductList = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;

  // Check if the category ID is valid
  if (!isValidObjectId(categoryId)) {
    throw new ApiError(400, "Invalid category ID");
  }

  // Fetch products based on the provided category ID
  const products = await Product.find({ category: categoryId })
    .select("name price description countInStock")
    .populate("category", "name"); // Populate the 'category' field with its name

  if (!products) {
    throw new ApiError(404, "Products not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, products, "Product listing retrieved successfully")
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

export { registerProduct, getProductList ,getProductDetails};
