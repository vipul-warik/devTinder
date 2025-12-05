const express = require("express");
const User = require("../models/user");
const { validateSignUpData } = require("../utils/validation");
const bcrypt = require("bcrypt");


const router = express.Router();

// Signup
router.post("/signin", async (req, res) => {
  try {
    const { firstName, lastName, emailId, password } = req.body;
    // Validation of data
    validateSignUpData(req);
    // Encrypt the password
    const passwordHash = await bcrypt.hash(password, 10);
    console.log(passwordHash);

    const userInstance = new User({
      firstName,
      lastName,
      password: passwordHash,
      emailId,
    });
    await userInstance.save();
    res.status(200).send("User Saved");
  } catch (error) {
    res.status(400).send("ERROR : " + error.message);
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    const user = await User.findOne({ emailId: emailId });

    if (!user) {
      throw new Error("Invalid Credentials");
    }

    const isPasswordValid = await user.validatePassword(password);

    if (isPasswordValid) {
      // Create a JWT Token

      const token = await user.getJWT();

      // Add the token to cookie and send the response back to the user

      res.cookie("token", token, {
        expires: new Date(Date.now() + 8 * 3600000),
      });
      res.send("Login Successful");
    } else {
      throw new Error("Invalid Credentials");
    }
  } catch (error) {
    res.status(400).send("ERROR : " + error.message);
  }
});

// Logout
router.post("/logout", (req, res) => {
    res.cookie("token", null, {
        expires: new Date(Date.now())
    });
    res.send("Logout Successful");
})





 module.exports = router;