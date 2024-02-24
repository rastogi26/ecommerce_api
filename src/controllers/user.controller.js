import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { json } from "express";

// generate token start
const generateAccessTokenAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // inserting refresh token in db
    user.refreshToken = refreshToken; // in user model there is a field called refresh token
    await user.save({ validateBeforeSave: false }); // done this because in user model like password field is true , save the refresh token without any validation in the db

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while generating access and refresh token"
    );
  }
};
// generate token end

const registerUser = asyncHandler(async (req, res) => {
  const {
    fullName,
    email,
    password,
    phone,
    street,
    apartment,
    pincode,
    city,
    country,
    isAdmin
  } = req.body;

  if (
    [fullName, email, password,phone,street,apartment,pincode,city,country].some((field) => field?.trim() === "") //field he aur trim kane ke baad bhi empty he the true
  ) {
    throw new ApiError(400, "All fields are required");
  }

  //user exist or not
  const existedUser = await User.findOne({ email });

  if (existedUser) {
    throw new ApiError(409, "User with email already exit");
  }

  // create user
  const user = await User.create({
    fullName: fullName.toLowerCase(),
    email,
    password,
    phone,
    street,
    apartment,
    pincode,
    city,
    country,
    isAdmin
  });

  // check if user created or not
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while regestering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username && !email) {
    // if both are empty
    throw new ApiError(400, "Username and email is required.");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  // step 5 if password is correct generate tokens
  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(user._id);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  //cookies
  const options = {
    // can see but not be able to modifed from frontend , only from server side
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, //this removes the field from document
      },
    },
    {
      new: true, //jo return me response milega usme new updated value miligi jisme refresh token undefined hoga na ki uski purani value
    }
  );

  //cookies
  const options = {
    // can see but not be able to modifed from frontend , only from server side
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

// making of endpoint for user so that it can gereate a refresh token
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken; //koyi cookies se bhej raha he ya phir mobile app  se access kar raha he

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token.");
    }

    // matching the token from user giving incoming and we have saved in user in gereateAccessAndRefreshToken
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    //if token is matched and verified then gerneate new tokens
    const options = { httpOnly: true, secure: true };

    const { accessToken, newRefreshToken } =
      await generateAccessTokenAndRefreshToken(user._id); //upar se jo hamne user find kiya tha findById

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  // First  want user so that we can verify the password,  we can get user from auth middleware as he is able to change the password so user is logged in
  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }

  // if old password is correct change it with new password
  user.password = newPassword;
  await user.save({ validateBeforeSave: false }); //pre hook is called in user model (hook works = if password is mot modified dont do anything just return but if it change bycrypt it and save it before moving on)

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password change successfully")); // {} => defines not sending any data
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser
};
