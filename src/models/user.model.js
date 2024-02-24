import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bycrypt from "bcrypt";

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    refreshToken: {
      type: String,
    },
    phone: {
      type: String,
      required: true,
    },
    street: {
      type: String,
      // default: "",
    },
    apartment: {
      type: String,
      // default: "",
    },
    pincode: {
      type: String,
      //default: "",
    },
    city: {
      type: String,
      //default: "",
    },
    country: {
      type: String,
      // default: "",
    },
    orderHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    cart: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          // required: true,
        },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// pre hook is used to encrypt the password before saving.
userSchema.pre("save", async function (next) {
  //to solve the problem of only call password field if it is modified so use if condition
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bycrypt.hash(this.password, 10);
  next();
});

//it is used to check the user password is correct or not
userSchema.methods.isPasswordCorrect = async function (password) {
  // compare takes two argument , 1. password in string and 2. encrypted password
  return await bycrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    //payload/data
    {
      _id: this._id, //coming from database
      email: this.email, //coming from database
      fullName: this.fullName, //coming from database
      //phone: this.phone,
      //street: this.street,
      //apartment:this.apartment,
      //pincode:this.pincode,
      //city:this.city,
      //country:this.country,
      //isAdmin:this.isAdmin

    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    //payload/data
    {
      _id: this._id, //coming from database
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
