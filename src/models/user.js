const mongoose = require("mongoose");
const validator = require("validator")

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 32,
    },
    lastName: {
        type: String,
        minLength: 3,
        maxLength: 32,
    },
    emailId: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate(value){
            if(!validator.isEmail(value))
            {
                throw new Error("Invalid email: "+value);
            }
        }
    },
    password: {
        type: String,
        required: true,
        validate(value){
            if(!validator.isStrongPassword(value))
            {
                throw new Error("Enter a strong password: "+value);
            }
        }
    },
    age: {
        type: Number,
        min: 18,
    },
    gender: {
        type: String,
        validate(value){
            if(!["male", "female", "others"].includes(value))
                throw new Error("Gender data is not valid");
        }
    },
    photoUrl: {
        type: String,
        default: "https://rapidapi-prod-apis.s3.amazonaws.com/0499ccca-a115-4e70-b4f3-1c1587d6de2b.png",
        validate(value){
            if(!validator.isURL(value))
            {
                throw new Error("Invalid photo URL: "+value);
            }
        }
    },
    about: {
        type: String,
        default: "This is a default about of the user!",
    },
    skills: {
        type: [String],
    },
},{
    timestamps: true,
});

module.exports = mongoose.model("User", userSchema);

