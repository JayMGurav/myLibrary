const express = require('express');
const cors = require('cors');

const whitelist = ['http://localhost:3000', 'https://localhost:3443','https://localhost:4200'];
var corsOptions = {
    origin: function (origin, callback) {
      if (whitelist.indexOf(origin) !== -1) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    }
  }

  module.exports = cors(corsOptions);