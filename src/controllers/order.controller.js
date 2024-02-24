import asyncHandler from "../utils/asyncHandler.js";
import { Order } from "../models/order.model.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const placeOrder = asyncHandler(async (req, res) => {

const {
    shippingAddress1,
    shippingAddress2,
    city,
    pincode,
    country,
    phone,
} = req.body;
  // Retrieve user's cart
  const user = await User.findById(req.user._id).populate("cart.product");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Check if the cart is empty
  if (user.cart.length === 0) {
    throw new ApiError(
      400,
      "Cart is empty. Add products to the cart before placing an order"
    );
  }

  // Calculate total price
  let totalPrice = 0;
  for (const item of user.cart) {
    totalPrice += item.product.price * item.quantity;
  }

  // Create order
  const orderItems = user.cart.map((item) => ({
    product: item.product._id,
    quantity: item.quantity,
  }));

  const order = await Order.create({
    orderItems,
    shippingAddress1,
    shippingAddress2,
    city,
    pincode,
    country,
    phone,
    totalPrice,
    user: req.user._id,
  });

  // Clear user's cart
  user.cart = [];
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order placed successfully"));
});


// Retrieve detailed information of a specific order by its ID
const getOrderDetails = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  // Find the order by its ID and populate the orderItems field to get detailed information about each item
  const order = await Order.findById(orderId).populate('orderItems.product');

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  return res.status(200).json(new ApiResponse(200, order, 'Order details retrieved successfully'));
});


export { placeOrder,getOrderDetails };
