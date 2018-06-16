'use strict';

var User = require('../models/user');

var findByNumber = function(number, callback) {
  User.findOne({
    "phoneNumber": number
  }, callback);
};

var createUserByNumber = function(number) {
  var newUser = new User({phoneNumber: number, stage: 'welcome'});
  newUser.save(function(err) {
    if(err) {
      console.log('error saving user!')
    } else {
      console.log('saved user!')
    }
  })
}

var updateStage = function(user, stage) {
  User.updateOne(user, {stage: stage}, function(err, res) {
    if(err) {
      throw "ERROR MOVING USER TO STAGE"
    }
    console.log('moved '+user.phoneNumber+' to stage '+stage)
  })
}

var deleteUserByNumber = function(number) {
  User.deleteOne({phoneNumber: number}, function(err) {
    console.log('deleted this number: ', number)
  })
}

module.exports.findByNumber = findByNumber;
module.exports.createUserByNumber = createUserByNumber;
module.exports.updateStage = updateStage;
module.exports.deleteUserByNumber = deleteUserByNumber;
