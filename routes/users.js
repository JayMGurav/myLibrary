const express = require('express');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Library = require('../models/Library');
const key = require('../config/key');
const passport = require('passport');
const cookieParser = require('cookie-parser')
const verifyUser = passport.authenticate('jwt', {session: false});

//load input validation
const validateSignupInput = require('../validation/signup');
const validateLoginInput = require('../validation/login');

const router = express.Router();
router.use(cookieParser())

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});




router.post('/signup', (req, res)=> {
  let { errors, isValid } = validateSignupInput(req.body);

  //check validation
  if(!isValid){
    return res.status(400).render('signup', { errors:errors });  
  }
  Library.findOne({ email: req.body.email })
    .then((user) => {
      if(user){
        errors.email = 'Email already Exists, Login Here';
        return res.status(400).render('login',{errors:errors});
      }
      else{
        const avatar = gravatar.url(req.body.email, {
          s: 200, //size
          r: 'pg', //Rating
          d: 'mm' //default
        });
        const newUser = new Library({
          username: req.body.username,
          email: req.body.email,
          avatar,
          password: req.body.password
        });

        bcrypt.genSalt(10, (err, salt, next)=>{
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if(err) throw err;
            newUser.password = hash;
            newUser.save()
            .then(user =>{
              res.statusCode = 200;
              res.redirect('/users/login');
            })
            .catch(err=>{
              console.log(err);
              next(err);
            });
          })
        })
      }
    })
});



//login
router.post('/login', (req, res, next) =>{
  let { errors, isValid } = validateLoginInput(req.body);
  //check validation
  if(!isValid){
    return res.status(400).render('login', {errors:errors});
  }

  const email = req.body.email;
  const password = req.body.password;

  Library.findOne({email})
    .then((user) => {
      if(!user){
        errors.email = 'User email not found, Signup Here';
        return res.status(404).render('signup', {errors:errors});
      }
      //check password
      bcrypt.compare(password, user.password, (err, match) => {
        if(err){
          return next(err);
        }
        if(match){
          //User matched generate token
          const payload = {
              id: user._id,
              username: user.username,
              email:user.email,
              // avatar: user.avatar
          }           
          res.clearCookie('Bearer')
          jwt.sign(payload, key.secrectOrKey, {expiresIn: 3600 }, (err, token) => {
          if(err) return next(err);
          res.cookie('Bearer',`${token}`,  { 
            expires:0,
            httpOnly: true 
          });    
          res.redirect('/users/library');
          })
        }           
        else{
          errors.password = 'Password incorrect, try again with the correct password'
          return res.status(401).render('login', {errors:errors});
        }
      })      
    },(err) => next(err))
    .catch((err) => next(err));
});



//get signup page
router.get('/signup',(req, res, next) => {
  res.statusCode = 200;
  res.render('signup' ,{errors:{username:null}});
});

//get login page
router.get('/login',(req, res, next) => {
  res.statusCode = 200;
  res.render('login' ,{errors:{username:null}});
});


//once login redirected to /library 
//where all the books are shown
router.get('/library', verifyUser ,  
    (req, res, next) => {
    const email = req.user.email;
    Library.findOne({email})
      .then((user) => {
        if(user != null){
          if(user.books.length != 0){
            let genres = user.books.map(x => x.genre);
            genres = genres.filter((x, i, a) => a.indexOf(x) == i); 
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html');
            res.render('book', {books: user.books, msg: false, genres: genres,activeGenre: null});    //, activeGenre: false
          }
          else{
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/html');
            res.render('book', {
              books: false, 
              msg: 'No books in your Library, Add by clicking the add button in the right-bottom corner',
              genres: [],
              activeGenre: null
            });
          }
        }
        else{
          res.statusCode = 404;
          res.setHeader('Content-Type', 'text/html');
          res.render('book', {books: false, msg: 'User does not exist!!'});
        }
      },(err) => next(err))
      .catch((err) => next(err));
})

//to filter acording to genre when clicked
router.post('/library' ,verifyUser,(req, res, next) => { //
  const email = req.user.email;
  Library.findOne({email})
  .then((user) => {
    if(!user){
      console.log('user not found');
    }
    else{      
      if(user.books.length != 0){
        let genres = user.books.map(x => x.genre);
        genres = genres.filter((x, i, a) => a.indexOf(x) == i); 
        if(genres.includes(req.body.genre)){
          const books = user.books.filter(x => x.genre === req.body.genre)
          console.log(books);
          res.statusCode = 200;
          res.json({books: books, msg: false, genres: genres, activeGenre: req.body.genre});
        }
        else{
          res.statusCode = 404;
          res.json({books: false, msg: `No books in your Library with ${req.body.genre}`,genres: genres, activeGenre: null});
        }
      }
      else{
        res.statusCode = 404;
        res.json({
          books: false, 
          msg: 'No books in your Library, Add by clicking the add button in the right-bottom corner',
          genres: [],
          activeGenre: false
        });
      } 
    }   
  },(err) => next(err))
  .catch((err) => next(err));
})


module.exports = router;
