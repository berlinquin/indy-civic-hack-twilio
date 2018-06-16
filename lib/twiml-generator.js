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

// Initial workflow

var welcome = function() {
  var resp = new MessagingResponse();
  resp.message('Hi! Do you need help finding a food pantry close to you?');
  return resp;
}

var requestAddress = function() {
  var resp = new MessagingResponse();
  resp.message('Ok, what is your current address?')
  return resp
}

var sendClosest = function(pantries) {
  var resp = new MessagingResponse();
  var msg = 'Thanks. Here are the closest food pantries to your location:\n'
  for (var i = 0; i < 3; i++) {
    var pantry = pantries[i]
    msg += ''+(i+1)+') '+pantry
    if (i < 2) {
      msg += '\n'
    }
  }
  resp.message(msg)
  return resp
}

// follow-up workflow for more info

var requestOutcomeString = function() {
  return 'Did you end up going to any of the pantries listed above?'
}

var requestOutcome = function() {
  var resp = new MessagingResponse()
  resp.message(requestOutcomeString)
  return resp
}

var requestReasonPositive = function() {
  var resp = new MessagingResponse()
  resp.message('Great! Why did you choose this one over the others?')
  return resp
}

var requestReasonNegative = function() {
  var resp = new MessagingResponse()
  resp.message('Ok. Did you find something else, or have trouble with transportation?')
  return resp
}

var getThanks = function() {
  var resp = new MessagingResponse()
  resp.message('Thank you for your feedback! We are doing our best to improve your access to food.')
  return resp
}

module.exports.requestAddress = requestAddress;
module.exports.sendClosest = sendClosest;
module.exports.requestOutcomeString = requestOutcomeString;
module.exports.requestOutcome = requestOutcome;
module.exports.requestReasonPositive = requestReasonPositive;
module.exports.requestReasonNegative = requestReasonNegative;
module.exports.getThanks = getThanks;

/**
* These questions all deal with determining SNAP eligibility
*/
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
