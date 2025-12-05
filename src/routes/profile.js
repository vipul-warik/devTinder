const express = require("express");
const { userAuth } = require("../middleware/auth");
const { validateEditProfile } = require("../utils/validation");
const validator = require("validator");
const bcrypt = require("bcrypt");

const router = express.Router();

// Profile View
router.get("/view", userAuth, async (req, res) => {
  try {
    const user = req.user;

    res.send(`User : ${user.firstName}`);
  } catch (error) {
    res.status(400).send("ERROR : " + error.message);
  }
});


// Profile Edit
router.patch("/edit", userAuth, async(req,res) => {
    try {
        if(!validateEditProfile(req)){
            throw new Error("Invalid Edit Request");
        }

        const user = req.user;

        Object.keys(req.body).forEach((key) => (
            user[key] = req.body[key]
        ));
         
        await user.save();

        res.json({
            message: `${user.firstName}, your profile has been updated!`,
            data: user
        })

    } catch (error) {
        res.status(400).send("ERROR : " + error.message);
    }
});

// Password Update
router.patch("/password", userAuth, async(req, res) => {
    try {
        const {currentPassword, newPassword} = req.body;

        if(!currentPassword || !newPassword){
            throw new Error("Invalid Password");
        }

        const user = req.user;

        const isPasswordValid = await user.validatePassword(currentPassword);

        if(!isPasswordValid){
            throw new Error("Invalid Password");
        }

        if(!validator.isStrongPassword(newPassword)){
            throw new Error("Weak Password");
        }

        user.password = await bcrypt.hash(newPassword, 10);

        await user.save();

        res.send("Password Changed");



    } catch (error) {
        res.status(400).send("ERROR : " + error.message);
    }
});

module.exports = router;