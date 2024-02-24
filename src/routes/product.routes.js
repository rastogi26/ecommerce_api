import { Router } from "express";
import {
    getProductDetails,
  getProductList,
  registerProduct,
} from "../controllers/product.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import isAdmin from "../middlewares/isAdmin.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/register-product").post(
  verifyJWT, //check user login or not,
  isAdmin, // check if user is admin or not
  upload.single("image"),
  registerProduct
);

router.route("/:categoryId").get(verifyJWT, getProductList);
router.route("/p/:productId").get(verifyJWT,getProductDetails)

export default router;
