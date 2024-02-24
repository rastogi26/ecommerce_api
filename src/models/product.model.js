import mongoose, { Schema } from "mongoose";

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    richDescription: {
      type: String,
      default: "",
    },
    image: {
      type: String, //cloudinary url
      required: true,
    },
    brand: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      default: 0,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    countInStock: {
      type: Number,
      required: true,
      min: 0,
      max: 255,
    },
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  { timestamps: true }
);


// Update product rating and numReviews when a new review is added
productSchema.methods.updateRating = async function () {
  const Review = mongoose.model("Review");
  const reviews = await Review.find({ product: this._id });
  const totalReviews = reviews.length;
  if (totalReviews === 0) {
    this.rating = 0;
    this.numReviews = 0;
  } else {
    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    this.rating = totalRating / totalReviews;
    this.numReviews = totalReviews;
  }
  await this.save();
};



export const Product = mongoose.model("Product", productSchema);
