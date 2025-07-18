const express = require("express");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
  },
  emailId: {
    type: String,
    lowercase: true,
    required: true,
    unique: true,
    trim: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Invalid email address: " + value);
      }
    },
  },
  password: {
    type: String,
    required: true,
    validate(value) {
      if (!validator.isStrongPassword(value)) {
        throw new Error("Enter a Strong Password: " + value);
      }
    },
  },
  gender: {
    type: String,
    enum: {
      values: ["Male", "Female", "Other"],
      message: `{VALUE} is not a valid gender type`,
    },
  },
  age: {
    type: Number,
    min: 18,
  },
  about: {
    type: String,
    default: "This is a default about of the user!",
  },
  skills: {
    type: [String],
  },
  photoUrl: {
    type: String,
    default: "https://images.icon-icons.com/3685/PNG/512/github_logo_icon_229278.png",
    validate(value) {
      if (!validator.isURL(value)) {
        throw new Error("Invalid Photo URL: " + value);
      }
    },
  },
});

userSchema.methods.validatePassword = async function (inputPassword) {
  return await bcrypt.compare(inputPassword, this.password);
};

//  Add method to generate JWT token
userSchema.methods.getJWT = function () {
  return jwt.sign({ id: this._id }, "DEV@Tinder$790", { expiresIn: "8h" });
};

const User = mongoose.model("User", userSchema);
module.exports = User;
