import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getOrderDetails, placeOrder } from "../controllers/order.controller.js";

const router = Router();

router.route("/place-order").post(verifyJWT, placeOrder);
router.route("/:orderId").get(verifyJWT,getOrderDetails);

export default router;
