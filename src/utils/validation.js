const validator = require('validator');

// SignUp validation
const validateSignUpData = (req) => {

    const {firstName, lastName, emailId, password} = req.body;

    if(!firstName){
        throw new Error("Name is not valid!");
    }
    else if(!validator.isEmail(emailId)){
        throw new Error("Email is not valid!");
    }
    else if(!validator.isStrongPassword(password)){
        throw new Error("Please enter a strong Password!");
    }

}

// Profile Edit validation
const validateEditProfile = (req) => {
    const allowedEditEditFields = ["firstName", "lastName", "photoUrl", "gender", "age", "about", "skills"];

    const isEditAllowed = Object.keys(req.body).every((field) => 
        allowedEditEditFields.includes(field));

    return isEditAllowed;
}

module.exports = {
    validateSignUpData,
    validateEditProfile,
}