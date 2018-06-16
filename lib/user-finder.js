'use strict';

var User = require('../models/user');

var findByNumber = function(number, callback) {
  User.findOne({
    "phoneNumber": number
  }, callback);
};

module.exports.findByNumber = findByNumber;
