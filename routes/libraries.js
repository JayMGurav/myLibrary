const express = require('express');
const Library = require('../models/Library');
const passport = require('passport');
const cors = require('./cors');

const libraryRouter = express.Router();
// const verifyUser = passport.authenticate('jwt', {successRedirect: '/main',
// failureRedirect: '/login',session: false});

libraryRouter.get('/',passport.authenticate('jwt', cors , {session: false}),
    (req, res, next) => {
    const email = req.user.email;
    // console.log(email);
    Library.findOne({email})
        .then((user) => {
            if(user != null){
                if(user.books.length != 0){
                    res.statusCode = 200;
                    res.setHeader('Content-Type','application/json');
                    res.render('book', {books: user.books});
                }
                else{
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.render('book', {books: user.books, msg: 'No books in your Library, Please add some '});
                }
            }
            else{
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({msg: 'User does not exist'});
            }
        },(err) => next(err))
        .catch((err) => next(err));
})
    // res.render('book');

module.exports = libraryRouter;