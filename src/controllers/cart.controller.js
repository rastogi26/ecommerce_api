import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Add product to cart
const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || !quantity || quantity <= 0) {
    throw new ApiError(400, "Invalid product ID or quantity");
  }

  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Check if the product already exists in the cart
  const existingProductIndex = user.cart.findIndex(
    (item) => item.product.toString() === productId
  );
  if (existingProductIndex !== -1) {
    // Product exists, update quantity
    user.cart[existingProductIndex].quantity += quantity;
  } else {
    // Product doesn't exist, add it to the cart
    user.cart.push({ product: productId, quantity });
  }

  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Product added to cart successfully"));
});

// Get user's cart
const getCart = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id).populate({
    path: "cart.product", // Populate the 'product' field inside the 'cart' array
    select: "name price icon", // Select the 'name', 'price', and 'icon' fields of the product
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Extract the cart items with product details
  const cartItems = user.cart.map((item) => ({
    product: item.product, // Include the product ID
    quantity: item.quantity,
    // Include the product details (name, price, and icon)
    details: item.product
      ? {
          name: item.product.name,
          price: item.product.price,
          icon: item.product.icon,
        }
      : null,
  }));

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        cartItems,
        "Successfully fetched the items in the cart"
      )
    );
});


// Update quantity of a product in the cart
const updateCartItem = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || !quantity || quantity <= 0) {
    throw new ApiError(400, "Invalid product ID or quantity");
  }

  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Find the product in the cart
  const cartItem = user.cart.find(item => item.product.toString() === productId);

  if (!cartItem) {
    throw new ApiError(404, "Product not found in cart");
  }

  cartItem.quantity = quantity;
  await user.save();

  return res
  .status(200)
  .json(new ApiResponse(200,{},"Successfully updated the cart Item"));
});

const removeCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  if (!productId) {
    throw new ApiError(400, "Invalid product ID");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $pull: { cart: { product: productId } } },
    { new: true } // Return the updated document
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, {}, "Successfully removed an item from the cart")
    );
});


export { addToCart, getCart, updateCartItem, removeCartItem };

/*    &&&&&&&&&&&&&&&&& getCart scenario &&&&&&&&&&&&&&
          {
  "status": 200,
  "data": [
    {
      "product": {
        "_id": "product_id_1",
        "name": "Product 1",
        "price": 10,
        "icon": "product_icon_url_1"
      },
      "quantity": 2
    },
    {
      "product": {
        "_id": "product_id_2",
        "name": "Product 2",
        "price": 20,
        "icon": "product_icon_url_2"
      },
      "quantity": 1
    }
  ],
  "message": "Successfully fetched the items in the cart"
}


*/
