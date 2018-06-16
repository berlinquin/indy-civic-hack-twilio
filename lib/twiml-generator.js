'use strict';

var MessagingResponse = require('twilio').twiml.MessagingResponse,
  _ = require('underscore');

// Twilio's code

var notFound = function() {
  var resp = new MessagingResponse();
  resp.message('We did not find the employee you\'re looking for');
  return resp;
};

var singleEmployee = function(employee) {
  var resp = new MessagingResponse();
  var message = resp.message();
  message.body(`${employee.fullName}\n${employee.phoneNumber}\n${employee.email}`);
  message.media(employee.imageUrl);
  return resp;
};

var multipleEmployees = function(employees) {
  var resp = new MessagingResponse();
  var optionsMessage = _.reduce(employees, function(memo, it) {
    return memo += `\n${it.option} for ${it.fullName}`;
  }, '');

  resp.message(`We found multiple people, reply with:${optionsMessage}\nOr start over`);
  return resp;
};

module.exports.notFound = notFound;

module.exports.singleEmployee = singleEmployee;

module.exports.multipleEmployees = multipleEmployees;

// My code

var welcome = function() {
  var resp = new MessagingResponse();
  resp.message('Hi! Do you need help determining your SNAP eligibility?');
  return resp;
}

var checkHousehold = function() {
  var resp = new MessagingResponse();
  resp.message('How many people do you live with?')
  return resp;
}

var checkDisabled = function() {
  var resp = new MessagingResponse();
  resp.message('Are you disabled, or unable to travel freely?');
  return resp;
}

var checkSeasonal = function() {
  var resp = new MessagingResponse();
  resp.message('Are you, or is anybody in your household, a seasonal or migrant worker?')
  return resp;
}

var checkHomeless = function() {
  var resp = new MessagingResponse();
  resp.message('Are you currently homeless?')
  return resp;
}

var checkIncome = function() {
  var resp = new MessagingResponse()
  resp.message('About how much do you make, in dollars, in an average week?')
  return resp
}

var getEligibleMessage = function() {
  var resp = new MessagingResponse()
  resp.message('Thanks for these answers! It looks like you might be eligible for SNAP benefits. Please contact your local office by calling 211.')
  return resp
}

module.exports.welcome = welcome;
module.exports.checkDisabled = checkDisabled;
module.exports.checkHousehold = checkHousehold;
module.exports.checkSeasonal = checkSeasonal;
module.exports.checkHomeless = checkHomeless;
module.exports.checkIncome = checkIncome;
module.exports.getEligibleMessage = getEligibleMessage;
