const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose');
const Library = mongoose.model('Library');
const key = require('./key');

const opts = {}
const cookieExtractor = function(req) {
    var token = null;
    if (req && req.cookies) {
        token = req.cookies.Bearer;
    }
    return token;
};

opts.jwtFromRequest = cookieExtractor;
opts.secretOrKey = key.secrectOrKey;
module.exports = (passport) => {
    passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
        Library.findById(jwt_payload.id)
        .then((user) => {
            if(user){
                return done(null, user);
            }
            return done(null, false);
        })
        .catch(err => console.log(err));
    }));
}

