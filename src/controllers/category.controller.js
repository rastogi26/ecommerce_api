import { Category } from "../models/category.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const createCategory = asyncHandler(async (req, res) => {
  const { name, color } = req.body;

  if (!name) {
    throw new ApiError(400, "Name is required");
  }

  // category name is unique
  const existingCategory = await Category.findOne({ name });

  if (existingCategory) {
    throw new ApiError(400, "Category with this name already exists");
  }

  const iconLocalPath = req.file?.path; // extract the path from local files in public

  if (!iconLocalPath) {
    throw new ApiError(400, "Icon is required");
  }
  const icon = await uploadOnCloudinary(iconLocalPath);

  if (!icon) {
    throw new ApiError(400, "Icon is required");
  }

  const categoryCreated = await Category.create({
    name: name.toLowerCase(),
    icon: icon.url, //cloudinary url
    color,
  });

  if (!categoryCreated) {
    throw new ApiError(500, "Failed to make a category");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, categoryCreated, "Successfully created a category")
    );
});


const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find();

 if (categories.length === 0) {     // if it return empty array 
   throw new ApiError(404, "No categories found");
 }
  
 
 return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        categories,
        "List of categories retrieved successfully"
      )
    );
});

export { createCategory, getAllCategories };
