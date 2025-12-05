const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

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
        enum: {
            values: ["male", "female", "other"],
            message: '`{VALUE}` is not supported',
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

userSchema.methods.getJWT = async function () {
    const user = this;

    const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

    return token;
}

userSchema.methods.validatePassword = async function(passwordInputByUser) {
    const user = this;
    const passwordHash = user.password;

    const isPasswordValid = await bcrypt.compare(
        passwordInputByUser,
        passwordHash,
        );

    return isPasswordValid;
}

module.exports = mongoose.model("User", userSchema);

