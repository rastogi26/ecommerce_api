import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addToCart,
  getCart,
  removeCartItem,
  updateCartItem,
} from "../controllers/cart.controller.js";

const router = Router();

router.route("/add-to-cart").post(verifyJWT, addToCart);
router.route("/get-cart").get(verifyJWT, getCart);
router.route("/update-cart-item").put(verifyJWT, updateCartItem);
router.route("/remove/:productId").delete(verifyJWT, removeCartItem);

export default router;
