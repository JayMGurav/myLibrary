const express = require('express');
const mongoose = require('mongoose');
const key = require('../config/key');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const passport = require('passport')
const path = require('path');
const Library = require('../models/Library');
const router = express.Router();
const url = key.url;
const verifyUser = passport.authenticate('jwt', { session: false });

const validateUploadInput = require('../validation/upload');

let gfs;
const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/Library',{ useNewUrlParser: true });
conn.on('error', console.error.bind(console, 'connection error:'));
conn.once('open', () => {
  //init stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
});

//create storage engine

const storage = new GridFsStorage({
  url: url,
  file: (req, file) => {
    return {
      filename:(file.fieldname + '-' + Date.now() + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1]),
      bucketName: 'uploads'
    };
  }
});

//fiter for file types with fieldname and extn
const filefilter = (req,file, cb) => {
  if(file.fieldname == 'image'){  //refers to field image in upload
    var filetypes = /jpeg|jpg|png/;  
  }
  else if(file.fieldname == 'book'){
    var filetypes = /pdf/;
  }
  var mimetype = filetypes.test(file.mimetype);
  var extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error("err: File upload only supports the following filetypes - " + filetypes))
}

//setting up multer
const upload = multer({ fileFilter: filefilter ,storage: storage }, (err) => {
  console.log(err);
});


// to delete from both upload.files and upload.chunks
const deleteMethod = (params_ids, next) => {
  gfs.files.deleteOne({ _id:params_ids.id2 })
  gfs.db.collection('uploads.chunks').deleteMany({files_id:params_ids.id1})
  .then((result) => {
    if(params_ids.id1 !="" || params_ids.id1 != null ){
       gfs.files.deleteOne({ _id:params_ids.id1 })
       gfs.db.collection('uploads.chunks').deleteMany({files_id:params_ids.id2})
      }
    else{
      return;
    }
    },(err) => next(err))
  .catch((err) => next(err));
}


//get for upload
//desc render upload form
router.get('/', (req, res) => {
  res.render('upload');
});

//@route POST for '/upload'
//@desc uploads file to DB
router.post('/', verifyUser ,upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'book', maxCount: 1 }
]), (req, res, next) => {
  const data = {
    image : req.files.image[0].filename.toLowerCase(),
    book: req.files.book[0].filename.toLowerCase(),
    title: req.body.title,
    genre: req.body.genre
  }
  // console.log(req.files.image);
  let { errors, isValid } = validateUploadInput(data);
  if(!isValid){
    deleteMethod({id1: req.files.image[0].id, id2: req.files.book[0].id });
    return res.status(400).render('upload', { errors:errors });  
  }

  const email = req.user.email;
  Library.findOne({ email })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ err: 'User does not exist' });
      }
      if ((user.books.indexOf(req.files.book[0].title) === -1)) {
        user.books.push({
          title: req.body.title,
          ISBN: req.body.ISBN,
          genre: req.body.genre,
          image: req.files.image[0].id,
          book: req.files.book[0].id
        });
      }
      user.save()
        .then((book) => {
          return res.redirect('/users/library')    //res.json(book);
        }, (err) => {
          deleteMethod({id1: req.files.image[0].id, id2: req.files.book[0].id });
          next(err)
        })
        .catch((err) =>next(err));
    }, (err) => next(err))
    .catch((err) => next(err));
},(err) => next(err) );


//get for image/:imageId
router.get('/image/:imageId', (req, res, next) => {
  gfs.files.find({_id:req.params.imageId}, (err, image) =>{
    if(err) next(err);
    const readStream = gfs.createReadStream({ _id: req.params.imageId});
    readStream.pipe(res)
  })
});

//get for book/:bookId  -display book
router.get('/book/:bookId', (req, res, next) => {
  gfs.files.find({_id:req.params.bookId}, (err, book) =>{
    if(err) next(err);
    const readStream = gfs.createReadStream({ _id: req.params.bookId});
    readStream.pipe(res)
  })
});

// router.get('/files', (req, res, next) => {
//   gfs.files.find().toArray((err, files) => {
//     if (!files || files.length === 0) {
//       return res.status(404).json({
//         err: 'no files exist'
//       });
//       }
//     //else files exist find them
//     return res.json(files);
//   })
// });

//delete file (book and image) from user.book.id
router.delete('/book', verifyUser, (req, res, next) => {
  const {id} =req.body;  //bookId
  Library.findOne({ email:req.user.email })
  .then((user) => {
    if(!user){
      console.log('Not a user');
      res.status(404).send('Not a user');
    }
    else{
      if(!user.books){
        console.log('No books in your library');
        res.status(404).json('No books in your library')
      }
      else{
        if(!user.books.id(id)){
          console.log('No book with id');
          res.status(404).json('No book with id');
        }
        else{
          console.log({found:user.books.id(id)});
          deleteMethod({id1:user.books.id(id).image, id2:user.books.id(id).book}); 
          user.books.id(id).remove()
          user.save()
          .then((book) => {
            res.status(200).json({success: true});
          },(err) => next(err))
          .catch((err) => next(err));
        }
      }
  }
},(err) => next(err))
.catch((err) => next(err))
})





// conn.close();
module.exports = router;





