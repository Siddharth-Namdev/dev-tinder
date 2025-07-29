// this is the starting point of any project
const express = require("express");
const connectDB = require("./config/database");
const User = require("./models/user");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");

require("dotenv").config();
require("./utils/cronjob")

// This is a middleware, who read the data and convert into js object
// this middleware is giveen by express , we are not created this , it is already created by express
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const paymentRouter = require("./routes/payment");
const initializeSocket = require("./utils/socket")


app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", paymentRouter);


const server = http.createServer(app);
initializeSocket(server);



connectDB()
  .then(() => {
    console.log("MongoDB Connected Successfully");
    server.listen(process.env.PORT, () => {
      console.log("server is started at 7777");
    });
  })
  .catch((err) => {
    console.log("error in connect mongoDB");
  });
