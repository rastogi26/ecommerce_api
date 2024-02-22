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
export { app };
