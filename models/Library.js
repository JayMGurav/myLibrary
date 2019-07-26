const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var bookSchema = new Schema({
    title:{
        type: String,
        required:true
    },
    ISBN:{
        type: String,
        default:"",
    },
    image:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'uploads.files'
    },
    book:{     
        type:mongoose.Schema.Types.ObjectId,
        ref: 'uploads',
        required: true
    },
    genre: {
        type:String,
        default: 'all'
    }
},{
    timestamps:true
});



var librarySchema = new Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required:true
    },
    avatar:{
        type:String
    },
    books:[bookSchema]
},{
    timestamps:true
});

module.exports = mongoose.model('Library', librarySchema);