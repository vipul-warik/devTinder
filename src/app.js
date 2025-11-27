const express = require("express");
const connectDB = require("./config/database");
const User = require("./models/user");
const {validateSignUpData} = require("./utils/validation")
const bcrypt = require("bcrypt");
require('dotenv').config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Signup
app.post("/signin", async(req, res) => {

    try {
    const {firstName, lastName, emailId, password} = req.body;
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
        res.status(400).send("ERROR : "+error.message);
    }


});

// Login
app.post("/login", async(req,res) => {
    try {
        const {emailId, password} = req.body;

        const user = await User.findOne({emailId: emailId});

        if(!user){
            throw new Error("Invalid Credentials");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if(isPasswordValid) {
            res.send("Login Successful");
        } else {
            throw new Error("Invalid Credentials");
        }

    } catch (error) {
        res.status(400).send("ERROR : "+error.message);
    }
})

// Get user by email
app.get("/user", async (req,res) => {
    const userEmail = req.body.emailId;

    try {
        const user = await User.find({emailId: userEmail});

        if(user.length === 0){
            res.status(404).send("User not found");
        } else {
            res.status(200).send(user);

        }


    } catch (error) {
        res.status(400).send("Something went wrong");
    }

});

// Feed API - GET /feed - get all the users form the database
app.get("/feed", async (req, res) => {
    try {
        const users = await User.find({});

        if(users.length === 0){
            res.status(404).send("No users found");
        }
        else{
            res.status(200).send(users);
        }


    } catch (error) {
        res.status(400).send("Something went wrong");
    }
});

// Delete user by ID
app.delete("/user", async (req,res) => {

    const userId = req.body.userId;

    try {
        const user = await User.findOneAndDelete({_id: userId});

        //console.log(user);

        if(!user){
            res.status(404).send("No user found");
        }else{
            res.status(200).send("User deleted");
        }
    } catch (error) {
        res.status(400).send("Something went wrong");
    }
});

// Update user data
app.patch("/user/:userId", async(req,res) => {
    const userId = req.params.userId;
    const data = req.body;

    try {

        const ALLOWED_UPDATES = ["photoUrl", "about",  "gender", "age", "skills"];
        const isUpdateAllowed = Object.keys(data).every((k) => 
        ALLOWED_UPDATES.includes(k));

        if(!isUpdateAllowed){
            throw new Error("Update not allowed");
        }

        if(data?.skills.length > 10){
            throw new Error("Skills cannot be more than 10");
        }

        if(data?.skills){
            data.skills = [...new Set(data.skills)];
        }

        const user = await User.findOneAndUpdate({_id: userId}, data, {
            returnDocument: "after",
            runValidators: true,
        })

        console.log(user);

        res.status(200).send("User Updated");

    } catch (error) {
        res.status(400).send("Error: "+error.message);
    }
});

// Update with userID

app.patch("/user-email", async (req, res) => {
    
    const emailId = req.body.emailId;
    const data = req.body;

    try {
        const user = await User.findOneAndUpdate({emailId: emailId}, data, {returnDocument: 'after'});

        if(!user){
            res.status(404).send("User not found");
        }
        else{
            res.status(200).send("User updated");

        }


    } catch (error) {
        res.status(400).send("Something went wrong");
    }
} );
 
// Global error handler
app.use((err, req, res, next) => {
    if(err){
        res.status(500).send("Internal server error");

    }
})



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
