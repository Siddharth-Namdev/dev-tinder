const express = require("express");
const authRouter = express.Router();

const { validateSignUpData } = require("../utils/validaton");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const cookieParser = require("cookie-parser");

authRouter.post("/signup", async (req, res) => {
  try {
    //check validation of data
    validateSignUpData(req);

    const { firstName, lastName, emailId, password } = req.body;

    //encrypt the password

    const passwordhash = await bcrypt.hash(password, 10);

    //creating a new instance of user model
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordhash,
    }); //req.body ->user ne jo data send kiya h usko leti h

    const savedUser = await user.save();

    const token = await savedUser.getJWT();
    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 3600000), // token expires in 8 hours
    });

    res.json({ message: "user added Successfully !!", data: savedUser }); //this is save the instance in the database
  } catch (err) {
    res.status(400).send("Error saving the user " + err.message);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    // const user = await User.find({emailId:emailId});
    const user = await User.findOne({ emailId });

    if (!user) {
      throw new Error("EmailID is not present in DB");
    }
    const isPasswordValid = await user.validatePassword(password);
    if (isPasswordValid) {
      const token = await user.getJWT();

      res.cookie("token", token, {
        expires: new Date(Date.now() + 8 * 3600000),
      });
      res.send(user);
    } else {
      throw new Error("Password is not correct");
    }
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

authRouter.post("/logout", async (req, res) => {
  res.cookie("token", null, {
    // token ko null kar diya
    expires: new Date(Date.now()), //expire date me current date dal di , jisse turant logout ho jye
  });
  res.send("Logout Successfull!!!!");
});

module.exports = authRouter;
