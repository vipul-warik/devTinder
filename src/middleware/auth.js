const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
    try {
        // Read the token from req cookies
        const {token} = req.cookies;

        if(!token){
            throw new Error("Invalid Token");
        }

        // Validate the token
        const {_id} = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById({_id});

        if(!user){
            throw new Error("No User Found");
        }

        req.user = user;

        next();
        
    } catch (error) {
        res.status(400).send("ERROR : "+error.message);
    }
}

module.exports = {
    userAuth
}