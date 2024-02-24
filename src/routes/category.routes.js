import { Router } from "express";
import { createCategory, getAllCategories } from "../controllers/category.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import isAdmin from "../middlewares/isAdmin.middleware.js";

const router = Router();

router.route("/create-category").post(
  verifyJWT, // Verify if the user is logged in
  isAdmin, // Check if the user is an admin
  upload.single("icon"), // Use upload.single() for a single file upload
  createCategory
);

router.route("/categories").get(verifyJWT,getAllCategories); //only login user will get the categories

export default router;
