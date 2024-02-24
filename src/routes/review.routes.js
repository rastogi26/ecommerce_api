import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import { submitReview } from "../controllers/review.controller.js";

const router = Router();

router.use(verifyJWT); //Apply verifyJWT middleware to all routes in this file

router.route("/submit").post(submitReview);
