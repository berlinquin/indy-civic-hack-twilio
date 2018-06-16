'use strict';

var mongoose = require('mongoose');

var User = new mongoose.Schema({
  phoneNumber: String,
  stage: String,
  disabled: Boolean,
  household: Number,
  seasonal: Boolean,
  homeless: Boolean,
  citizen: Boolean,
  income: Number
})

module.exports = mongoose.model('user', User);
