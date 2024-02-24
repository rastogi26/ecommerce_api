import { asyncHandler } from "../utils/asyncHandler.js";
import { Order } from "../models/order.model.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { OrderItem } from "../models/orderItem.model.js";

const placeOrder = asyncHandler(async (req, res) => {
  const { shippingAddress1, city, pincode, country, phone } = req.body;

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

  // Calculate total price and create orderItems array
  let totalPrice = 0;
  const orderItems = [];

  // Iterate over each item in the user's cart
  for (const item of user.cart) {
    // Calculate the total price for this item
    const itemTotalPrice = item.product.price * item.quantity;

    // Create a new OrderItem document
    const newOrderItem = new OrderItem({

      quantity: item.quantity,
      _id: item.product._id,
    });

    // Save the OrderItem document to the database
    await newOrderItem.save();

    // Add the OrderItem to the orderItems array
    orderItems.push(newOrderItem._id);

    // Add the total price of this item to the total price of the order
    totalPrice += itemTotalPrice;
  }

  // Create a new Order document
  const order = await Order.create({
    orderItems,
    shippingAddress1,
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

  // Send response
  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order placed successfully"));
});

const getOrderDetails = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  // Find the order by its ID and populate the orderItems field to get detailed information about each item
  const order = await Order.findById(orderId).populate({
    path: "orderItems",
    populate: {
      path: "product",
      select: "name image price",
    },
  });

  // If the order is not found, throw an error
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Send response
  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order details retrieved successfully"));
});




export { placeOrder, getOrderDetails };
