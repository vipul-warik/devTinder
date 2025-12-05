const express = require("express");
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");


require("dotenv").config();
const app = express();
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 3000;

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/ user");

app.use("/", authRouter);
app.use("/profile", profileRouter);
app.use("/request", requestRouter);
app.use("/user", userRouter);



// Global error handler
app.use((err, req, res, next) => {
  if (err) {
    res.status(500).send("Internal server error");
  }
});

connectDB()
  .then(() => {
    console.log("Database connection established");
    app.listen(PORT, () => {
      console.log(`Server is successfully listening on port 3000...`);
    });
  })
  .catch((err) => {
    console.error("Database cannot be connected");
  });
