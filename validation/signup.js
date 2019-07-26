const validator = require('validator');
const isEmpty = require('./is-Empty');

module.exports = function validateSignupInput(data){
    let errors = {};

    data.username = !isEmpty(data.username) ? data.username : '';
    data.email = !isEmpty(data.email) ? data.email : '';
    data.password = !isEmpty(data.password) ? data.password : '';
    data.password2 = !isEmpty(data.password2) ? data.password2 : '';

    if(!validator.isLength(data.username, { min: 3, max: 10 })){
        errors.username = 'Username must be between 3 to 10 characters'
    }
    if(validator.isEmpty(data.username)){
        errors.username = 'User name is required'
    }
    if(validator.isEmpty(data.email)){
        errors.email = 'Email is required'
    }
    if(!validator.isEmail(data.email)){
        errors.email = 'Email is invalid'
    }
    if(validator.isEmpty(data.password)){
        errors.password = 'Password is required'
    }
    if(!validator.isLength(data.password, { min: 6, max: 30 })){
        errors.password = 'Password must be between 6 to 30 characters'
    }
    if(!validator.equals(data.password, data.password2)){
        errors.password2 = 'Passwords must match'
    }
    if(validator.isEmpty(data.password2)){
        errors.password2 = 'Confirm Password is required'
    }
    

    return{
        errors,
        isValid: isEmpty(errors)
    }
}