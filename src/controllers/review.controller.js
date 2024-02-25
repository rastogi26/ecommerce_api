import { Review } from "../models/review.model.js";
import { Product } from "../models/product.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { isValidObjectId } from "mongoose";

const submitReview = asyncHandler(async (req, res) => {
  const { productId, rating, comment } = req.body;

if (!isValidObjectId(productId)) {
  throw new ApiError("Invalid project id");
}

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }
  console.log(product);

  // Create a new review
  const review = await Review.create({
    user: req.user._id, // Assuming user is authenticated and req.user contains user information
    product: productId,
    rating,
    comment,
  });
  console.log(review);

  // Update product rating and numReviews
  await product.updateRating();

  return res
    .status(200)
    .json(new ApiResponse(200, review, "Review submitted successfully"));
});

export { submitReview };
