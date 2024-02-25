# E-commerce API Backend

## Introduction

Welcome to the E-commerce API Backend project, this project implements a RESTful API to support various e-commerce operations, including product and category management, cart management, order processing, and user authentication.

## Important links

| Content           | Link                   |
| ----------------- | ---------------------- |
| API Documentation | [API Documentation](https://documenter.getpostman.com/view/20699474/2sA2rCVMgc) |
| Models            | [Model Definitions](https://www.canva.com/design/DAF9xl2_oJE/BpyBG3FobC7MpcZtuVPlQQ/edit) |

## Features

### User Management:

- User registration, login, logout
- Change Password , Refresh and Access Token

### Product Management:

- Product creation
- Get product for particular category id
- Get product for particular product id
- Review method
- Only admin can create the product

### Order Management:

- Placing orders
- Viewing order details

### Cart Management:

- Adding, updating, and removing items from the cart

### Review and Rating:

- Adding product reviews
- Rating products
- Adding comment on product

## Middleware Used

- Auth middleware to check only login user can do actions.
- isAdmin middleware to check only admin can do the particular actions.
- Multer middleware to upload image in local file than to cloudinary and remove file from local path.

## Technologies Used

- Node.js
- Express.js
- MongoDB
- Cloudinary (for image storage)

## Installation and Setup

1. **Clone the repository:**

   ```bash
   https://github.com/rastogi26/ecommerce_api.git
   ```

2. **Install dependencies:**

   ```bash
   cd ecommerce_api
   npm install
   ```

3. **Set up environment variables:**
   Create a .env file in the root of the project and populate it with the required variables. You can refer to the .env.sample file for guidance.

4. **Start the server:**

   ```bash
   npm run dev
   ```
