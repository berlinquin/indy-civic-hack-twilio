'use strict';

var User = require('../models/user');

var findByNumber = function(number, callback) {
  User.findOne({
    "phoneNumber": number
  }, callback);
};

var createUserByNumber = function(number) {
  var newUser = new User({phoneNumber: number});
  newUser.save(function(err) {
    if(err) {
      console.log('error saving user!')
    } else {
      console.log('saved user!')
    }
  })
}

module.exports.findByNumber = findByNumber;
module.exports.createUserByNumber = createUserByNumber;
