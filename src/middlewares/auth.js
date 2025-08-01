const jwt = require("jsonwebtoken");
const User = require("../models/user");
const cookieParser = require("cookie-parser");

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).send("Please Login !!!");
    }

    const decodedObj = jwt.verify(token, process.env.JWT_SECRET);
    const { id } = decodedObj;

    const user = await User.findById(id);
    if (!user) {
      throw new Error("user not found");
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
};

module.exports = { userAuth };
