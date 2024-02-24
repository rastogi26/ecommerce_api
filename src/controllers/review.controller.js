import { Review } from "../models/review.model.js";
import { Product } from "../models/product.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const submitReview = asyncHandler(async (req, res) => {
  const { productId, rating, comment } = req.body;

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Create a new review
  const review = await Review.create({
    user: req.user?._id,
    product: productId,
    rating,
    comment,
  });

  if (!review) {
    throw new ApiError(500, "Failed to submit a review");
  }

  // Update product rating
  await product.updateRating();

  return res
    .status(200)
    .json(new ApiResponse(200, review, "Review submitted successfully"));
});

export {submitReview}