const validator = require('validator');
const mime = require('mime-types');
const isEmpty = require('./is-Empty');

module.exports = function validateUploadInput(data){
    let errors = {};

    data.image = !isEmpty(data.image) ? data.image : '';
    data.book = !isEmpty(data.book) ? data.book : '';
    data.title = !isEmpty(data.title) ? data.title : '';
    data.genre = !isEmpty(data.genre) ? data.genre : '';
    let format = ['image/png','image/jpg','image/jpeg']
    if(validator.isEmpty(data.image)){
        errors.image = 'Image is required'
    }
    if(!format.includes(mime.lookup(data.image))){
        errors.image = 'Invalid format -only png|jpeg is allowed'
    }
    if(validator.isEmpty(data.book)){
        errors.book = 'Book is required'
    }
    if(mime.lookup(data.book) != 'application/pdf'){
        errors.book = 'Invalid format -only pdf is allowed'
    }
    if(validator.isEmpty(data.title)){
        errors.title = 'Book title is required'
    }
    if(validator.isEmpty(data.genre)){
        errors.genre = 'Book genre is required'
    }
    return{
        errors,
        isValid: isEmpty(errors)
    }
}