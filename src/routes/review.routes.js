import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware";
import { submitReview } from "../controllers/review.controller";

const router = Router();

router.use(verifyJWT); //Apply verifyJWT middleware to all routes in this file

router.route("/submit").post(submitReview);
