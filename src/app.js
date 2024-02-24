import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    //origin helps to specify from which we are accepting requests from frontend
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
/*To set a limit on json data , to avoid the unlimited json data incoming as server might crash */
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" })); //accpects data from url
app.use(express.static("public")); //static is used to store the files,folders,pdfs,images on our server , in this it is stored in public folder
app.use(cookieParser());

// routes import
import userRouter from "./routes/user.routes.js";
import reviewRouter from "./routes/review.routes.js";
import categoryRouter from "./routes/category.routes.js";
import productRouter from "./routes/product.routes.js";
import cartRouter from "./routes/cart.routes.js";
import orderRouter from "./routes/order.routes.js";

//routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/review", reviewRouter);
app.use("/api/v1/category", categoryRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/order", orderRouter);

export { app };
