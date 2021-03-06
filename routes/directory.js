'use strict';

var express = require('express')
  , router = express.Router()
  , twilio = require('twilio')
  , employeeFinder = require('../lib/employee-finder')
  , userFinder = require('../lib/user-finder')
  , _ =  require('underscore')
  , twimlGenerator = require('../lib/twiml-generator')
  , watson = require('../lib/watson');

const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// run once to reset my interaction
userFinder.deleteUserByNumber('+15672678038')

// POST /directory/test
router.post('/test/', function(req, res, next) {
  try {
    var body = req.body;
    var msg = body.Body.toLowerCase().trim()
    var userPhone = body.From
    console.log('got this body: ', body)
    console.log('parsed this phone: ', userPhone)

    res.type('text/xml');

    var user = userFinder.findByNumber(userPhone, function(err, user) {
      if (err) {
        throw 'ERROR FINDING USER BY NUMBER'
      }
      if (user === null) {
        userFinder.createUserByNumber(userPhone)
        res.send(twimlGenerator.welcome().toString())
      }
      else {
        nextStageLocation(user, msg, res)
      }
    })
  }
  catch(err) {
    console.log(err)
  }
})

function nextStageLocation(user, msg, res) {
  var stage = user.stage;
  var request
  console.log('got user in this stage: ', stage)
  if (stage === 'welcome') {
    userFinder.updateStage(user, 'address')
    request = twimlGenerator.requestAddress().toString()
    res.send(request)
  }
  else if (stage === 'address') {
    userFinder.updateStage(user, 'followup')
    // TODO Get closest pantries
    var pantries = ['one', 'two', 'three']
    request = twimlGenerator.sendClosest(pantries).toString()
    res.send(request)
    setTimeout(function () {
      sendMessage(twimlGenerator.requestOutcomeString(), user.phoneNumber)
    }, 2000);
  }
  else if (stage === 'followup') {
    userFinder.updateStage(user, 'thanks')
    watson.isPositive(msg)
    .then(isPositive => {
      if (isPositive) {
        request = twimlGenerator.requestReasonPositive()
      } else {
        request = twimlGenerator.requestReasonNegative()
      }
      res.send(request)
    })
  }
  else if (stage === 'thanks') {
    userFinder.updateStage(user, 'done')
    request = twimlGenerator.getThanks().toString()
    res.send(request)
  }
  else {
    console.log('No match for stage: ', stage)
  }
}

function sendMessage(msg, number) {
  console.log('sending '+msg+' to '+number)
  client.messages
    .create({
       body: msg,
       from: '+13177932789',
       to: number
     })
    .then(message => console.log('sent message: ',message))
    .done();
}

// move user thru eligibility workflow
function nextStageEligibility(user, msg, res) {
  var stage = user.stage;
  var request
  var promise
  console.log('got user in this stage: ', stage)
  if (stage === 'welcome') {
    userFinder.updateStage(user, 'household')
    request = twimlGenerator.checkHousehold().toString()
    promise = Promise.resolve()
  }
  else if (stage === 'household') {
    userFinder.updateStage(user, 'disabled')
    request = twimlGenerator.checkDisabled().toString()
    promise = watson.getNumber(msg)
  }
  else if (stage === 'disabled') {
    userFinder.updateStage(user, 'seasonal')
    request = twimlGenerator.checkSeasonal().toString()
    promise = watson.isPositive(msg)
  }
  else if (stage === 'seasonal') {
    userFinder.updateStage(user, 'homeless')
    request = twimlGenerator.checkHomeless().toString()
    promise = watson.isPositive(msg)
  }
  else if (stage === 'homeless') {
    userFinder.updateStage(user, 'income')
    request = twimlGenerator.checkIncome().toString()
    promise = watson.getNumber(msg)
  }
  else if (stage === 'income') {
    userFinder.updateStage(user, 'final')
    request = twimlGenerator.getEligibleMessage().toString()
    promise = watson.isPositive(msg)
  }
  else {
    console.log('No match for stage: ', stage)
    request = 'OK'
    promise = Promise.resolve()
  }
  promise.then(sentiment => {
    if (sentiment !== undefined) {
      userFinder.updateField(user, stage, sentiment)
    }
  })
  res.send(request)
}

// POST /directory/search/
router.post('/search/', function(req, res, next) {
  var body = req.body.Body;
  res.type('text/xml');

  if (req.cookies.cachedEmployees !== undefined && !isNaN(body)) {
    var cachedEmployees = req.cookies.cachedEmployees;
    var employeeId = cachedEmployees[body];
    if (employeeId === undefined) {
      res.send(twimlGenerator.notFound().toString());
    } else {
      employeeFinder.findById(employeeId, function(err, employee) {
        res.clearCookie('cachedEmployees');
        res.send(twimlGenerator.singleEmployee(employee).toString());
      });
    }
  } else {
    employeeFinder.findByName(body, function(err, employees) {
      if (employees.length === 0) {
        res.send(twimlGenerator.notFound().toString());
      } else if (employees.length === 1) {
        res.send(twimlGenerator.singleEmployee(employees[0]).toString());
      } else {
        var options = _.map(employees, function(it, index) {
          return { option: index + 1, fullName: it.fullName, id: it.id };
        });
        var cachedEmployees = _.object(_.map(options, function(it) { return [it.option, it.id]; }));
        res.cookie('cachedEmployees', cachedEmployees, { maxAge: 1000 * 60 * 60 });

        res.send(twimlGenerator.multipleEmployees(options).toString());
      }
    });
  }
});

module.exports = router;
