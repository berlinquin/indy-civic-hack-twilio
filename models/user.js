'use strict';

var mongoose = require('mongoose');

var User = new mongoose.Schema({
  phoneNumber: String,
  stage: String,
  isDisabled: Boolean
})

module.exports = mongoose.model('user', User);
